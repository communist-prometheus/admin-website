import { beforeEach, describe, expect, it } from 'vitest'
import { createRepo, type SubscriberRepo } from './repo'
import { makeTestD1 } from './test-d1'
import { DUPLICATE_ERROR_NAME } from './types'

let repo: SubscriberRepo
const now = () => '2026-06-03T08:00:00.000Z'

beforeEach(() => {
  repo = createRepo({ db: makeTestD1(), now })
})

describe('SubscriberRepo.insert', () => {
  it('persists a new active subscriber and lower-cases the email', async () => {
    const s = await repo.insert({ email: 'Test@Comprom.ORG', langs: ['ru'] })
    expect(s.email).toBe('test@comprom.org')
    expect(s.langs).toEqual(['ru'])
    expect(s.status).toBe('active')
    expect(s.createdAt).toBe('2026-06-03T08:00:00.000Z')
    /*
     * `last_sent_at` is the address's own "what is new" watermark, so a
     * new row is seeded with one (the shared cutoff when the caller
     * supplies it, else the signup moment) rather than left null.
     */
    expect(s.lastSentAt).toBe('2026-06-03T08:00:00.000Z')
  })

  it('throws DuplicateError when an active row with that email exists', async () => {
    await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    await expect(
      repo.insert({ email: 'a@b.c', langs: ['en'] })
    ).rejects.toMatchObject({ name: DUPLICATE_ERROR_NAME })
  })

  it('lets a previously-unsubscribed email be re-added as active', async () => {
    const s1 = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    await repo.setStatus(s1.id, 'unsubscribed')
    const s2 = await repo.insert({ email: 'a@b.c', langs: ['en'] })
    expect(s2.id).not.toBe(s1.id)
    expect(s2.status).toBe('active')
  })
})

describe('SubscriberRepo.listActive / listAll', () => {
  it('lists only active rows, excluding unsubscribed and bounced', async () => {
    const a = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const b = await repo.insert({ email: 'b@b.c', langs: ['en'] })
    await repo.insert({ email: 'c@b.c', langs: ['it'] })
    await repo.setStatus(a.id, 'unsubscribed')
    await repo.setStatus(b.id, 'bounced')
    const active = await repo.listActive()
    expect(active.map(s => s.email)).toEqual(['c@b.c'])
    const all = await repo.listAll()
    expect(all).toHaveLength(3)
  })
})

describe('SubscriberRepo.findById / updateLangs', () => {
  it('returns the row by id and reflects an updated langs[] array', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const updated = await repo.updateLangs(s.id, ['ru', 'en'])
    expect(updated?.langs).toEqual(['ru', 'en'])
    const found = await repo.findById(s.id)
    expect(found?.langs).toEqual(['ru', 'en'])
  })

  it('returns undefined for unknown ids', async () => {
    expect(await repo.findById(999)).toBeUndefined()
    expect(await repo.updateLangs(999, ['ru'])).toBeUndefined()
  })
})

describe('SubscriberRepo.remove', () => {
  it('hard-deletes the row and reports it gone afterwards', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const ok = await repo.remove(s.id)
    expect(ok).toBe(true)
    expect(await repo.findById(s.id)).toBeUndefined()
  })

  it('returns false when the id does not match a row', async () => {
    expect(await repo.remove(123)).toBe(false)
  })
})

describe('SubscriberRepo.setStatus', () => {
  it('flips status and stamps unsubscribed_at on transitions away from active', async () => {
    const s = await repo.insert({ email: 'a@b.c', langs: ['ru'] })
    const after = await repo.setStatus(s.id, 'unsubscribed')
    expect(after?.status).toBe('unsubscribed')
    expect(after?.unsubscribedAt).toBe('2026-06-03T08:00:00.000Z')
  })

  it('returns undefined for unknown ids', async () => {
    expect(await repo.setStatus(999, 'bounced')).toBeUndefined()
  })
})
