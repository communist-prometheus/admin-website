import { beforeEach, describe, expect, it } from 'vitest'
import { makeTestD1 } from '../subscribers/test-d1'
import { createSettingsRepo, type SettingsRepo } from './repo'

let repo: SettingsRepo

beforeEach(() => {
  repo = createSettingsRepo({ db: makeTestD1() })
})

describe('SettingsRepo.getSchedule', () => {
  it('returns the seeded default schedule with nextRunAt (R2.3)', async () => {
    const r = await repo.getSchedule(new Date('2026-06-01T00:00:00.000Z'))
    expect(r?.cron).toBe('0 12 * * 6')
    expect(r?.timezone).toBe('Europe/Moscow')
    expect(r?.nextRunAt).toBe('2026-06-06T09:00:00.000Z')
  })
})

describe('SettingsRepo.setSchedule', () => {
  it('upserts a new value and returns the updated row with nextRunAt', async () => {
    const fresh = { cron: '*/15 * * * *', timezone: 'Etc/UTC' }
    const saved = await repo.setSchedule(
      fresh,
      new Date('2026-06-01T00:00:00.000Z')
    )
    expect(saved.cron).toBe('*/15 * * * *')
    expect(saved.timezone).toBe('Etc/UTC')
    expect(saved.nextRunAt).toBe('2026-06-01T00:15:00.000Z')
  })

  it('persists across reads', async () => {
    const fresh = { cron: '0 8 * * 1', timezone: 'Europe/Moscow' }
    await repo.setSchedule(fresh, new Date('2026-06-01T00:00:00.000Z'))
    const got = await repo.getSchedule(new Date('2026-06-01T00:00:00.000Z'))
    expect(got?.cron).toBe('0 8 * * 1')
    expect(got?.timezone).toBe('Europe/Moscow')
    expect(got?.nextRunAt).toBe('2026-06-01T05:00:00.000Z')
  })
})
