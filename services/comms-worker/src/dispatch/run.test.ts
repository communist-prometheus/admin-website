import { beforeEach, describe, expect, it } from 'vitest'
import type { ResendClient, SendInput, SendResult } from '../resend/types'
import type { Article } from '../rss/types'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { createSettingsRepo, type SettingsRepo } from '../settings/repo'
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
  batchSizes: number[]
} => {
  const sends: SendInput[] = []
  const batchSizes: number[] = []
  return {
    sends,
    batchSizes,
    client: {
      send: async input => {
        sends.push(input)
        return reply(input)
      },
      sendBatch: async inputs => {
        batchSizes.push(inputs.length)
        for (const i of inputs) sends.push(i)
        const replies = inputs.map(reply)
        const firstFail = replies.find(r => !r.ok)
        return firstFail !== undefined && !firstFail.ok
          ? { ok: false, error: firstFail.error }
          : { ok: true, ids: replies.map(r => (r.ok ? r.id : '')) }
      },
    },
  }
}

let subs: SubscriberRepo
let log: SendLogRepo
let settings: SettingsRepo

beforeEach(() => {
  const db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  settings = createSettingsRepo({ db })
})

const noIssue = async (): Promise<Article | undefined> => undefined

const baseDeps = (
  rss: (l: Lang) => Promise<ReadonlyArray<Article>>,
  resend: ResendClient,
  magazine: (l: Lang) => Promise<Article | undefined> = noIssue
) => ({
  subscriberRepo: subs,
  sendLogRepo: log,
  settingsRepo: settings,
  rss,
  magazine,
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
  it('skips subscribers when nothing new exists past the global cutoff', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await settings.setCutoffAt('2026-06-07T00:00:00.000Z')
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-01T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 1 })
    expect(resend.sends).toHaveLength(0)
    // cutoff is NOT advanced on a tick that sent nothing.
    expect(await settings.getCutoffAt()).toBe('2026-06-07T00:00:00.000Z')
  })
})

describe('runDispatch — happy path', () => {
  it('sends one digest, advances the global cutoff, records a sent row', async () => {
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
    // cutoff is advanced to tickAt after the successful send.
    expect(await settings.getCutoffAt()).toBe(TICK.toISOString())
    const logs = await log.listRecent(10)
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      status: 'sent',
      resendId: 're_42',
      articleCount: 3,
    })
  })
})

describe('runDispatch — new magazine issue with no new articles', () => {
  it('sends when only a fresh issue exists past the cutoff', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await settings.setCutoffAt('2026-06-04T00:00:00.000Z')
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-01T00:00:00.000Z' })],
    })
    const fresh = article({
      guid: 'np',
      lang: 'ru',
      link: 'https://comprom.org/ru/magazine/issue-9',
      pubDate: '2026-06-05T00:00:00.000Z',
    })
    const resend = buildResend(() => ({ ok: true, id: 're_np' }))
    const summary = await runDispatch(
      baseDeps(rss.fn, resend.client, async () => fresh)
    )
    expect(summary).toMatchObject({ sent: 1, failed: 0, skipped: 0 })
    expect(resend.sends).toHaveLength(1)
    expect(resend.sends[0]?.html).toContain('ru/magazine/issue-9')
  })

  it('skips when the only issue predates the cutoff and nothing is new', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await settings.setCutoffAt('2026-06-04T00:00:00.000Z')
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-01T00:00:00.000Z' })],
    })
    const old = article({
      guid: 'np-old',
      lang: 'ru',
      pubDate: '2026-06-02T00:00:00.000Z',
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch(
      baseDeps(rss.fn, resend.client, async () => old)
    )
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 1 })
    expect(resend.sends).toHaveLength(0)
  })
})

describe('runDispatch — targeted test send', () => {
  it('dispatches only the targeted ids and leaves the cutoff untouched', async () => {
    const a = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await subs.insert({ email: 'b@b.c', langs: ['ru'] })
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 're_t' }))
    const summary = await runDispatch({
      ...baseDeps(rss.fn, resend.client),
      targetIds: [a.id],
    })
    expect(summary).toMatchObject({ sent: 1, failed: 0, skipped: 0 })
    expect(resend.sends).toHaveLength(1)
    expect(resend.sends[0]?.to).toBe('a@b.c')
    // targeted sends must NOT advance the shared watermark.
    expect(await settings.getCutoffAt()).toBeUndefined()
  })

  it('sends to nobody when the targeted set is empty', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch({
      ...baseDeps(rss.fn, resend.client),
      targetIds: [],
    })
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 0 })
    expect(resend.sends).toHaveLength(0)
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
    // all three recipients go out in ONE Resend batch call, not three —
    // this is the fix for the per-second rate-limit mass failure.
    expect(resend.batchSizes).toEqual([3])
  })
})

describe('runDispatch — batch failure (data-loss guard)', () => {
  it('marks every recipient failed and does NOT advance the cutoff', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await subs.insert({ email: 'b@b.c', langs: ['ru'] })
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({
      ok: false,
      error: 'resend 429 (retry exhausted)',
    }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 2, skipped: 0 })
    // a failed broadcast must replay next tick — the watermark stays put.
    expect(await settings.getCutoffAt()).toBeUndefined()
    const logs = await log.listRecent(10)
    expect(logs).toHaveLength(2)
    expect(logs.every(l => l.status === 'failed')).toBe(true)
  })
})

describe('runDispatch — Resend failure', () => {
  it('records a failed row and leaves the global cutoff untouched on Resend 5xx', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: false, error: 'resend 503' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 1, skipped: 0 })
    expect(await settings.getCutoffAt()).toBeUndefined()
    const logs = await log.listRecent(10)
    expect(logs[0]).toMatchObject({
      status: 'failed',
      resendId: undefined,
      error: 'resend 503',
    })
  })
})

describe('runDispatch — skips bounced / complained (R4.6, R4.7)', () => {
  it('does not send to subscribers whose status is bounced', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await subs.setStatus(s.id, 'bounced')
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 0 })
    expect(resend.sends).toHaveLength(0)
  })

  it('does not send to subscribers whose status is complained', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await subs.setStatus(s.id, 'complained')
    const rss = buildRss({
      ru: [article({ guid: 'a', pubDate: '2026-06-05T00:00:00.000Z' })],
    })
    const resend = buildResend(() => ({ ok: true, id: 'r' }))
    const summary = await runDispatch(baseDeps(rss.fn, resend.client))
    expect(summary).toMatchObject({ sent: 0, failed: 0, skipped: 0 })
    expect(resend.sends).toHaveLength(0)
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
