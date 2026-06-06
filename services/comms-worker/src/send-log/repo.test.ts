import type { D1Database } from '@cloudflare/workers-types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSendLogRepo, type SendLogRepo } from './repo'

let repo: SendLogRepo
let db: D1Database

const seedSubscribers = async (ids: ReadonlyArray<number>): Promise<void> => {
  const subs = createRepo({
    db,
    now: () => '2026-05-01T00:00:00.000Z',
  })
  for (const id of ids) {
    await subs.insert({ email: `s${id}@example.test`, langs: ['ru'] })
  }
}

beforeEach(() => {
  db = makeTestD1()
  repo = createSendLogRepo({ db })
})

describe('SendLogRepo.append + listRecent', () => {
  it('round-trips a single sent row', async () => {
    await seedSubscribers([1, 2, 3, 4, 5, 6, 7])
    await repo.append({
      subscriberId: 7,
      tickAt: '2026-06-06T09:00:00.000Z',
      articleCount: 3,
      status: 'sent',
      resendId: 're_abc',
      error: undefined,
    })
    const rows = await repo.listRecent(10)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      subscriberId: 7,
      tickAt: '2026-06-06T09:00:00.000Z',
      articleCount: 3,
      status: 'sent',
      resendId: 're_abc',
      error: undefined,
    })
  })

  it('persists an error message on failed rows', async () => {
    await seedSubscribers([1, 2, 3, 4, 5, 6, 7])
    await repo.append({
      subscriberId: 7,
      tickAt: '2026-06-06T09:00:00.000Z',
      articleCount: 3,
      status: 'failed',
      resendId: undefined,
      error: 'resend 503',
    })
    const rows = await repo.listRecent(10)
    expect(rows[0]?.error).toBe('resend 503')
    expect(rows[0]?.resendId).toBeUndefined()
  })

  it('orders rows newest tick_at first and respects the limit', async () => {
    await seedSubscribers([1, 2, 3])
    await repo.append({
      subscriberId: 1,
      tickAt: '2026-06-01T00:00:00.000Z',
      articleCount: 1,
      status: 'sent',
      resendId: 'a',
      error: undefined,
    })
    await repo.append({
      subscriberId: 2,
      tickAt: '2026-06-08T00:00:00.000Z',
      articleCount: 1,
      status: 'sent',
      resendId: 'b',
      error: undefined,
    })
    await repo.append({
      subscriberId: 3,
      tickAt: '2026-06-05T00:00:00.000Z',
      articleCount: 1,
      status: 'sent',
      resendId: 'c',
      error: undefined,
    })
    const rows = await repo.listRecent(2)
    expect(rows.map(r => r.subscriberId)).toEqual([2, 3])
  })
})

describe('SendLogRepo.purgeOlderThan', () => {
  it('deletes only rows whose tick_at is older than the cutoff', async () => {
    await seedSubscribers([1, 2])
    await repo.append({
      subscriberId: 1,
      tickAt: '2025-12-01T00:00:00.000Z',
      articleCount: 0,
      status: 'sent',
      resendId: 'old',
      error: undefined,
    })
    await repo.append({
      subscriberId: 2,
      tickAt: '2026-06-01T00:00:00.000Z',
      articleCount: 0,
      status: 'sent',
      resendId: 'new',
      error: undefined,
    })
    const removed = await repo.purgeOlderThan('2026-03-01T00:00:00.000Z')
    expect(removed).toBe(1)
    const rows = await repo.listRecent(10)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.resendId).toBe('new')
  })

  it('returns 0 when nothing matches the cutoff', async () => {
    await seedSubscribers([1])
    await repo.append({
      subscriberId: 1,
      tickAt: '2026-06-01T00:00:00.000Z',
      articleCount: 0,
      status: 'sent',
      resendId: 'r',
      error: undefined,
    })
    expect(await repo.purgeOlderThan('2025-01-01T00:00:00.000Z')).toBe(0)
  })
})
