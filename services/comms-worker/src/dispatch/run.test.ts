import { beforeEach, describe, expect, it } from 'vitest'
import type { ResendClient, SendInput, SendResult } from '../resend/types'
import type { Article } from '../rss/types'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import type { Lang } from '../subscribers/types'
import { runDispatch } from './run'

const TICK = new Date('2026-06-06T09:00:00.000Z')
const SECRET = 'shhh-secret-key-1234567890'
const FROM = 'Communist Prometheus <newsletter@comprom.org>'
const PUBLIC_BASE = 'https://lists.comprom.org'

const article = (overrides: Partial<Article>): Article => ({
  guid: 'g',
  title: 't',
  link: 'https://x/y',
  lang: 'ru',
  pubDate: '2026-06-05T00:00:00.000Z',
  ...overrides,
})

const buildRss = (
  byLang: Readonly<Partial<Record<Lang, ReadonlyArray<Article>>>>
) => {
  const calls: Lang[] = []
  const fn = async (l: Lang): Promise<ReadonlyArray<Article>> => {
    calls.push(l)
    return byLang[l] ?? []
  }
  return { fn, calls }
}

const buildResend = (
  reply: (input: SendInput) => SendResult
): {
  client: ResendClient
  sends: SendInput[]
} => {
  const sends: SendInput[] = []
  return {
    sends,
    client: {
      send: async input => {
        sends.push(input)
        return reply(input)
      },
    },
  }
}

let subs: SubscriberRepo
let log: SendLogRepo

beforeEach(() => {
  const db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
})

const baseDeps = (
  rss: (l: Lang) => Promise<ReadonlyArray<Article>>,
  resend: ResendClient
) => ({
  subscriberRepo: subs,
  sendLogRepo: log,
  rss,
  resend,
  secret: SECRET,
  fromAddress: FROM,
  publicBaseUrl: PUBLIC_BASE,
  tickAt: TICK,
})

describe('runDispatch — empty list', () => {
  it('does nothing when there are no active subscribers', async () => {
    const rss = buildRss({})
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 0 })
    expect(rss.calls).toEqual([])
    expect(resend.sends).toHaveLength(0)
  })
})

describe('runDispatch — empty delta', () => {
  it('skips subscribers when nothing new exists for their langs', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await subs.markSent(s.id, '2026-06-07T00:00:00.000Z')
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-01T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 1 })
    expect(resend.sends).toHaveLength(0)
    const after = await subs.findById(s.id)
    expect(after?.lastSentAt).toBe('2026-06-07T00:00:00.000Z')
  })
})

describe('runDispatch — happy path', () => {
  it('sends one digest, advances last_sent_at, records a sent row', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const rss = buildRss({
      ru: [
        article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' }),
        article({ guid: 'b', pubDate: '2026-06-04T00:00:00.000Z' }),
        article({ guid: 'c', pubDate: '2026-06-03T00:00:00.000Z' }),
      ],
    })
    const resend = buildResend(() => ({ ok: true, id: 're_42' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 1, failed: 0, skipped: 0 })
    expect(resend.sends).toHaveLength(1)
    const sent = resend.sends[0]
    expect(sent?.from).toBe(FROM)
    expect(sent?.to).toBe('a@b.c')
    expect(sent?.idempotencyKey).toBe(`${s.id}:${TICK.toISOString()}`)
    expect(sent?.headers?.['List-Unsubscribe']).toMatch(/^<https:.+>$/)
    const after = await subs.findById(s.id)
    expect(after?.lastSentAt).toBe(TICK.toISOString())
    const logs = await log.listRecent(10)
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      status: 'sent',
      resendId: 're_42',
      articleCount: 3,
    })
  })
})

describe('runDispatch — RSS caching across subscribers', () => {
  it('fetches each unique lang exactly once even with many subscribers', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await subs.insert({ email: 'b@b.c', langs: ['ru', 'en'] })
    await subs.insert({ email: 'c@b.c', langs: ['en'] })
    const rss = buildRss({
      ru: [article({ guid: 'r', lang: 'ru' })],
      en: [article({ guid: 'e', lang: 'en' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    await runDispatch(baseDeps(rss.fn, resend.client))
    expect([...rss.calls].sort()).toEqual(['en', 'ru'])
    expect(rss.calls).toHaveLength(2)
    expect(resend.sends).toHaveLength(3)
  })
})

describe('runDispatch — Resend failure', () => {
  it('records a failed row and leaves last_sent_at untouched on Resend 5xx', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: false, error: 'resend 503' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 1, skipped: 0 })
    const after = await subs.findById(s.id)
    expect(after?.lastSentAt).toBeUndefined()
    const logs = await log.listRecent(10)
    expect(logs[0]).toMatchObject({
      status: 'failed',
      resendId: undefined,
      error: 'resend 503',
    })
  })
})

describe('runDispatch — retention sweep', () => {
  it('purges send_log rows older than the retention window after the dispatch', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await log.append({
      subscriberId: s.id,
      tickAt: '2025-12-01T00:00:00.000Z',
      articleCount: 0,
      status: 'sent',
      resendId: 'old',
      error: undefined,
    })
    const rss = buildRss({})
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    await runDispatch({
      ...baseDeps(rss.fn, resend.client),
      retentionDays: 30,
    })
    const logs = await log.listRecent(10)
    expect(logs.map(l => l.resendId)).not.toContain('old')
  })
})
