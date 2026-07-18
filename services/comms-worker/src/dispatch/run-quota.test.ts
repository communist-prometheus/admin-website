import { beforeEach, describe, expect, it } from 'vitest'
import type { BatchResult, ResendClient, SendInput } from '../resend/types'
import type { Article } from '../rss/types'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { createSettingsRepo, type SettingsRepo } from '../settings/repo'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import type { Lang } from '../subscribers/types'
import { runDispatch } from './run'

const TICK = new Date('2026-06-06T09:00:00.000Z')
const NEXT_MIDNIGHT = '2026-06-07T00:00:00.000Z'
const FROM = 'Communist Prometheus <newsletter@comprom.org>'

const article = (guid: string): Article => ({
  guid,
  title: 't',
  link: 'https://x/y',
  lang: 'ru',
  pubDate: '2026-06-05T00:00:00.000Z',
})

/** A resend whose BATCH endpoint reports the daily quota exhausted. */
const quotaResend = (
  quota: 'daily' | 'monthly'
): { client: ResendClient; batchCalls: number; reports: SendInput[] } => {
  const reports: SendInput[] = []
  let batchCalls = 0
  return {
    reports,
    get batchCalls() {
      return batchCalls
    },
    client: {
      send: async input => {
        reports.push(input)
        return { ok: true, id: 'report' }
      },
      sendBatch: async (): Promise<BatchResult> => {
        batchCalls += 1
        return {
          ok: false,
          error: `resend ${quota}_quota_exceeded`,
          definitive: false,
          quota,
        }
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

const buildRss =
  (byLang: Readonly<Partial<Record<Lang, ReadonlyArray<Article>>>>) =>
  async (l: Lang): Promise<ReadonlyArray<Article>> =>
    byLang[l] ?? []

const noIssue = async (): Promise<Article | undefined> => undefined

const deps = (resend: ResendClient) => ({
  subscriberRepo: subs,
  sendLogRepo: log,
  settingsRepo: settings,
  rss: buildRss({ ru: [article('a')] }),
  magazine: noIssue,
  resend,
  secret: 'shhh-secret-key-1234567890',
  fromAddress: FROM,
  publicBaseUrl: 'https://lists.comprom.org',
  tickAt: TICK,
})

describe('runDispatch — daily quota', () => {
  it('pauses the dispatch until the next quota reset', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const resend = quotaResend('daily')
    const summary = await runDispatch(deps(resend.client))

    expect(summary.pausedUntil).toBe(NEXT_MIDNIGHT)
    expect(await settings.getPausedUntil()).toBe(NEXT_MIDNIGHT)
  })

  it('does NOT advance the cutoff, so the un-sent address replays after reset', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await runDispatch(deps(quotaResend('daily').client))

    // Global cutoff not advanced, and the address's own watermark stays
    // at its seed (2026-05-01) rather than moving to the tick — so the
    // 2026-06-05 article is still "new" on tomorrow's tick.
    expect(await settings.getCutoffAt()).toBeUndefined()
    const s = (await subs.listActive())[0]
    expect(s?.lastSentAt).toBe('2026-05-01T00:00:00.000Z')
    expect(s?.lastSentAt).not.toBe(TICK.toISOString())
  })

  it('records the attempted recipient as failed, not sent', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const summary = await runDispatch(deps(quotaResend('daily').client))

    expect(summary).toMatchObject({ sent: 0, failed: 1 })
    const rows = await log.listRecent(10)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ status: 'failed' })
  })

  it('mails a PAUSED run report naming the resume instant', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const resend = quotaResend('daily')
    await runDispatch(deps(resend.client))

    expect(resend.reports).toHaveLength(1)
    expect(resend.reports[0]?.subject).toContain('PAUSED')
    expect(resend.reports[0]?.text).toContain(NEXT_MIDNIGHT)
  })

  it('pauses until the next month on a monthly quota', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const summary = await runDispatch(deps(quotaResend('monthly').client))
    expect(summary.pausedUntil).toBe('2026-07-01T00:00:00.000Z')
  })
})
