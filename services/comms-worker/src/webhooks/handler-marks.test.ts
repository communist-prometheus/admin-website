import type { D1Database } from '@cloudflare/workers-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { listTickSummaries } from '../send-log/ticks'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { applyResendEvent } from './handler'

/*
 * A bounce is the OUTCOME of a send, not a dispatch of its own. It used
 * to be appended as a fresh `send_log` row stamped with the webhook's
 * own clock, which surfaced in the editor's journal as a dispatch "from
 * 13:37" that delivered "0 материалов". The event now settles the
 * status of the row it belongs to.
 */

const TICK = '2026-08-08T09:00:00.000Z'

let db: D1Database
let subs: SubscriberRepo
let log: SendLogRepo
let subscriberId: number

beforeEach(async () => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  subscriberId = (await subs.insert({ email: 'a@x.t', langs: ['ru'] })).id
  await log.append({
    subscriberId,
    tickAt: TICK,
    articleCount: 2,
    status: 'sent',
    resendId: 're_1',
    error: undefined,
  })
})

describe('a delivery event settles the send it belongs to', () => {
  it('flips the original row instead of inventing a 0-article dispatch', async () => {
    await applyResendEvent(subs, log, {
      type: 'email.bounced',
      data: { email_id: 're_1' },
    })
    const runs = await listTickSummaries(db, 50, 0)
    expect(runs).toHaveLength(1)
    expect(runs[0]).toMatchObject({
      tickAt: TICK,
      recipients: 1,
      sent: 0,
      bounced: 1,
      articleCount: 2,
    })
  })

  it('still marks the subscriber bounced', async () => {
    await applyResendEvent(subs, log, {
      type: 'email.bounced',
      data: { email_id: 're_1' },
    })
    expect((await subs.findById(subscriberId))?.status).toBe('bounced')
  })

  it('records a complaint against the same send', async () => {
    await applyResendEvent(subs, log, {
      type: 'email.complained',
      data: { email_id: 're_1' },
    })
    const [run] = await listTickSummaries(db, 50, 0)
    expect(run).toMatchObject({ recipients: 1, complained: 1 })
  })

  it('ignores an event whose resend id it never sent', async () => {
    await applyResendEvent(subs, log, {
      type: 'email.bounced',
      data: { email_id: 're_unknown' },
    })
    const [run] = await listTickSummaries(db, 50, 0)
    expect(run).toMatchObject({ recipients: 1, sent: 1 })
  })
})
