import type { D1Database } from '@cloudflare/workers-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSendLogRepo, type SendLogRepo } from './repo'
import { listTickSummaries } from './ticks'

/*
 * `send_log` holds ONE ROW PER RECIPIENT, so the raw table is not a
 * dispatch history: a single Saturday run to 120 addresses is 120 rows,
 * and a lone Resend bounce webhook is a 1-row "run" with 0 articles.
 * The editor asked for the run history, so the read model groups the
 * rows back into the tick that produced them.
 */

let db: D1Database
let subs: SubscriberRepo
let log: SendLogRepo

const seed = async (email: string): Promise<number> =>
  (await subs.insert({ email, langs: ['ru'] })).id

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
})

describe('dispatch history grouped by tick', () => {
  it('collapses one row per recipient into one run', async () => {
    const tickAt = '2026-08-08T09:00:00.000Z'
    for (const email of ['a@x.t', 'b@x.t', 'c@x.t']) {
      await log.append({
        subscriberId: await seed(email),
        tickAt,
        articleCount: 2,
        status: 'sent',
        resendId: `re_${email}`,
        error: undefined,
      })
    }
    const [run, ...rest] = await listTickSummaries(db, 50, 0)
    expect(rest).toEqual([])
    expect(run).toMatchObject({
      tickAt,
      recipients: 3,
      sent: 3,
      articleCount: 2,
    })
  })

  it('counts each outcome of a partially failed run separately', async () => {
    const tickAt = '2026-07-11T09:00:00.000Z'
    const statuses = ['sent', 'sent', 'failed', 'bounced', 'skipped'] as const
    for (const [i, status] of statuses.entries()) {
      await log.append({
        subscriberId: await seed(`s${i}@x.t`),
        tickAt,
        articleCount: 1,
        status,
        resendId: undefined,
        error: status === 'failed' ? 'resend 500' : undefined,
      })
    }
    const [run] = await listTickSummaries(db, 50, 0)
    expect(run).toMatchObject({
      recipients: 5,
      sent: 2,
      failed: 1,
      bounced: 1,
      skipped: 1,
    })
  })

  it('orders runs newest first and pages through them', async () => {
    for (const day of ['05', '06', '07']) {
      await log.append({
        subscriberId: await seed(`d${day}@x.t`),
        tickAt: `2026-06-${day}T09:00:00.000Z`,
        articleCount: 1,
        status: 'sent',
        resendId: undefined,
        error: undefined,
      })
    }
    const first = await listTickSummaries(db, 2, 0)
    expect(first.map(r => r.tickAt.slice(0, 10))).toEqual([
      '2026-06-07',
      '2026-06-06',
    ])
    const second = await listTickSummaries(db, 2, 2)
    expect(second.map(r => r.tickAt.slice(0, 10))).toEqual(['2026-06-05'])
  })
})
