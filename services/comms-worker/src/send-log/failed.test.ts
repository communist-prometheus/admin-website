import { beforeEach, describe, expect, it } from 'vitest'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { listFailedRecipients } from './failed'
import { createSendLogRepo, type SendLogRepo } from './repo'

let db: ReturnType<typeof makeTestD1>
let subs: SubscriberRepo
let log: SendLogRepo

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
})

const row = (
  subscriberId: number,
  tickAt: string,
  status: 'sent' | 'failed'
) =>
  log.append({
    subscriberId,
    tickAt,
    articleCount: 3,
    status,
    resendId: status === 'sent' ? 're_1' : undefined,
    error: status === 'failed' ? 'resend 409' : undefined,
  })

describe('listFailedRecipients', () => {
  /*
   * The retry button must be safe by construction: it targets ONLY
   * addresses whose most recent attempt failed. An address that has since
   * been mailed successfully can never be picked up again, so pressing
   * the button twice cannot produce a duplicate.
   */
  it('picks an address whose latest attempt failed', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await row(s.id, '2026-07-11T09:00:00.000Z', 'failed')
    const out = await listFailedRecipients(db)
    expect(out.map(r => r.email)).toEqual(['a@b.c'])
    expect(out[0]?.error).toBe('resend 409')
  })

  it('ignores an address whose failure was followed by a success', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await row(s.id, '2026-07-04T09:00:00.000Z', 'failed')
    await row(s.id, '2026-07-11T09:00:00.000Z', 'sent')
    expect(await listFailedRecipients(db)).toEqual([])
  })

  it('ignores an address that has only ever succeeded', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await row(s.id, '2026-07-11T09:00:00.000Z', 'sent')
    expect(await listFailedRecipients(db)).toEqual([])
  })

  it('ignores an address that was never mailed at all', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    expect(await listFailedRecipients(db)).toEqual([])
  })

  /* A bounced address is not active; re-sending to it is what got it bounced. */
  it('ignores an address that is no longer active', async () => {
    const s = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await row(s.id, '2026-07-11T09:00:00.000Z', 'failed')
    await subs.setStatus(s.id, 'bounced')
    expect(await listFailedRecipients(db)).toEqual([])
  })

  it('returns every failed address, not just the newest tick', async () => {
    const a = await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    const b = await subs.insert({ email: 'b@b.c', langs: ['ru'] })
    await row(a.id, '2026-07-11T09:00:00.000Z', 'failed')
    await row(b.id, '2026-06-17T09:00:00.000Z', 'failed')
    const out = await listFailedRecipients(db)
    expect(out.map(r => r.email).sort()).toEqual(['a@b.c', 'b@b.c'])
  })
})
