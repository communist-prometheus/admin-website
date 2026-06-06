import type { D1Database } from '@cloudflare/workers-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSendLogRepo, type SendLogRepo } from './repo'
import { listRecentWithEmail } from './with-email'

let db: D1Database
let subs: SubscriberRepo
let log: SendLogRepo

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
})

describe('listRecentWithEmail', () => {
  it('joins subscriber.email onto each row', async () => {
    const s = await subs.insert({
      email: 'reader@example.test',
      langs: ['ru'],
    })
    await log.append({
      subscriberId: s.id,
      tickAt: '2026-06-06T09:00:00.000Z',
      articleCount: 3,
      status: 'sent',
      resendId: 're_42',
      error: undefined,
    })
    const rows = await listRecentWithEmail(db, 10)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.email).toBe('reader@example.test')
    expect(rows[0]?.status).toBe('sent')
    expect(rows[0]?.articleCount).toBe(3)
  })

  it('returns undefined email when the subscriber row was deleted', async () => {
    const s = await subs.insert({ email: 'gone@example.test', langs: ['ru'] })
    await log.append({
      subscriberId: s.id,
      tickAt: '2026-06-06T09:00:00.000Z',
      articleCount: 1,
      status: 'sent',
      resendId: 're_1',
      error: undefined,
    })
    await subs.remove(s.id)
    const rows = await listRecentWithEmail(db, 10)
    expect(rows[0]?.email).toBeUndefined()
    expect(rows[0]?.subscriberId).toBeUndefined()
  })

  it('orders rows newest tick first and obeys the limit', async () => {
    const a = await subs.insert({ email: 'a@x.t', langs: ['ru'] })
    const b = await subs.insert({ email: 'b@x.t', langs: ['ru'] })
    const c = await subs.insert({ email: 'c@x.t', langs: ['ru'] })
    await log.append({
      subscriberId: a.id,
      tickAt: '2026-06-01T00:00:00.000Z',
      articleCount: 1,
      status: 'sent',
      resendId: 'a',
      error: undefined,
    })
    await log.append({
      subscriberId: b.id,
      tickAt: '2026-06-08T00:00:00.000Z',
      articleCount: 1,
      status: 'sent',
      resendId: 'b',
      error: undefined,
    })
    await log.append({
      subscriberId: c.id,
      tickAt: '2026-06-05T00:00:00.000Z',
      articleCount: 1,
      status: 'failed',
      resendId: undefined,
      error: 'resend 500',
    })
    const rows = await listRecentWithEmail(db, 2)
    expect(rows.map(r => r.email)).toEqual(['b@x.t', 'c@x.t'])
    expect(rows[1]?.error).toBe('resend 500')
  })
})
