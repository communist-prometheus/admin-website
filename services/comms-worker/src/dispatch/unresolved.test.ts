import { beforeEach, describe, expect, it } from 'vitest'
import type { ResendClient, SendResult } from '../resend/types'
import type { Article } from '../rss/types'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { listTickSummaries } from '../send-log/ticks'
import { createSettingsRepo, type SettingsRepo } from '../settings/repo'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import type { Lang } from '../subscribers/types'
import { runDispatch } from './run'

/*
 * 2026-09-12: a batch that Resend was still processing answered 409 until
 * the retry budget ran out, and all 100 of its recipients were written
 * into `send_log` as `failed`. They had not failed — nobody knew, and the
 * journal showed a red run for mail that may well have been delivered.
 *
 * An unresolved batch is recorded as its own outcome: not a success (the
 * watermark must not move, so the next tick replays it) and not a failure
 * (nothing is known to have gone wrong).
 */

const TICK = new Date('2026-09-12T09:00:00.000Z')
const FROM = 'Communist Prometheus <newsletter@comprom.org>'

let db: ReturnType<typeof makeTestD1>
let subs: SubscriberRepo
let log: SendLogRepo
let settings: SettingsRepo

const article = (guid: string): Article => ({
  guid,
  title: guid,
  link: `https://x/${guid}`,
  lang: 'ru',
  pubDate: '2026-09-11T00:00:00.000Z',
})

/** A Resend client whose batch endpoint never settles (409 to exhaustion). */
const stillProcessing = (): ResendClient => ({
  send: async (): Promise<SendResult> => ({ ok: false, error: 'unused' }),
  sendBatch: async () => ({
    ok: false,
    error: 'resend 409 (retry exhausted)',
    definitive: false,
    unresolved: true,
  }),
})

/** A Resend client whose batch endpoint genuinely fails. */
const brokenServer = (): ResendClient => ({
  send: async (): Promise<SendResult> => ({ ok: false, error: 'unused' }),
  sendBatch: async () => ({
    ok: false,
    error: 'resend 503 (retry exhausted)',
    definitive: false,
    unresolved: false,
  }),
})

const deps = (resend: ResendClient) => ({
  subscriberRepo: subs,
  sendLogRepo: log,
  settingsRepo: settings,
  rss: async (_l: Lang): Promise<ReadonlyArray<Article>> => [article('a')],
  magazine: async (_l: Lang): Promise<Article | undefined> => undefined,
  resend,
  secret: 'shhh-secret-key-1234567890',
  fromAddress: FROM,
  publicBaseUrl: 'https://lists.comprom.org',
  tickAt: TICK,
})

beforeEach(async () => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  settings = createSettingsRepo({ db })
  await settings.setCutoffAt('2026-09-05T09:00:00.000Z')
  for (const n of [1, 2, 3])
    await subs.insert({ email: `s${n}@x.t`, langs: ['ru'] })
})

describe('a batch Resend was still processing', () => {
  it('records nobody as failed', async () => {
    await runDispatch(deps(stillProcessing()))
    const rows = await log.listRecent(20)
    expect(rows.filter(r => r.status === 'failed')).toEqual([])
  })

  it('records the recipients as unresolved, carrying the reason', async () => {
    await runDispatch(deps(stillProcessing()))
    const rows = await log.listRecent(20)
    expect(rows).toHaveLength(3)
    for (const row of rows) {
      expect(row.status).toBe('skipped')
      expect(row.error).toContain('409')
    }
  })

  it('leaves the watermark alone so the next tick replays the batch', async () => {
    await runDispatch(deps(stillProcessing()))
    expect(await settings.getCutoffAt()).toBe('2026-09-05T09:00:00.000Z')
    // `last_sent_at` is seeded when the row is created; an unresolved
    // send must leave it exactly where it was.
    const all = await subs.listActive()
    for (const s of all) expect(s.lastSentAt).toBe('2026-05-01T00:00:00.000Z')
  })

  it('reads in the journal as a run with no confirmed delivery', async () => {
    await runDispatch(deps(stillProcessing()))
    const [run] = await listTickSummaries(db, 10, 0)
    expect(run).toMatchObject({
      recipients: 3,
      sent: 0,
      failed: 0,
      skipped: 3,
    })
  })

  it('reports the unresolved recipients in the tick summary', async () => {
    const summary = await runDispatch(deps(stillProcessing()))
    expect(summary).toMatchObject({ sent: 0, failed: 0, unresolved: 3 })
  })
})

describe('a batch that genuinely failed', () => {
  it('is still recorded as failed, not quietly downgraded', async () => {
    await runDispatch(deps(brokenServer()))
    const rows = await log.listRecent(20)
    expect(rows).toHaveLength(3)
    for (const row of rows) expect(row.status).toBe('failed')
  })
})
