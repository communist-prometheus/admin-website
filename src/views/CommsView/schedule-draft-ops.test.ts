import { describe, expect, it } from 'vitest'
import {
  canSubmitSchedule,
  hasChanged,
  initialDraft,
} from './schedule-draft-ops'

const REMOTE = {
  cron: '0 12 * * 6',
  timezone: 'Europe/Moscow',
  nextRunAt: '2026-06-06T09:00:00.000Z',
}

describe('initialDraft', () => {
  it('returns the persisted cron + timezone when one is loaded', () => {
    expect(initialDraft(REMOTE)).toEqual({
      cron: '0 12 * * 6',
      timezone: 'Europe/Moscow',
    })
  })

  it('falls back to the spec default when nothing is loaded yet', () => {
    expect(initialDraft(undefined)).toEqual({
      cron: '0 12 * * 6',
      timezone: 'Europe/Moscow',
    })
  })
})

describe('hasChanged', () => {
  it('is false when the draft matches the loaded schedule', () => {
    expect(hasChanged(REMOTE, REMOTE)).toBe(false)
  })

  it('is true when the cron differs', () => {
    expect(
      hasChanged({ cron: '*/30 * * * *', timezone: 'Europe/Moscow' }, REMOTE)
    ).toBe(true)
  })

  it('is true when the tz differs', () => {
    expect(
      hasChanged({ cron: '0 12 * * 6', timezone: 'Etc/UTC' }, REMOTE)
    ).toBe(true)
  })

  it('is true when no remote schedule is loaded yet', () => {
    expect(hasChanged(REMOTE, undefined)).toBe(true)
  })
})

describe('canSubmitSchedule', () => {
  it('rejects an empty cron', () => {
    expect(canSubmitSchedule({ cron: '', timezone: 'Etc/UTC' })).toBe(false)
  })

  it('rejects an empty timezone', () => {
    expect(canSubmitSchedule({ cron: '0 12 * * 6', timezone: '' })).toBe(
      false
    )
  })

  it('rejects shapes that are not five whitespace-separated fields', () => {
    expect(canSubmitSchedule({ cron: '0 12 * *', timezone: 'Etc/UTC' })).toBe(
      false
    )
  })

  it('accepts a well-shaped 5-field expression with a non-empty tz', () => {
    expect(
      canSubmitSchedule({ cron: '0 12 * * 6', timezone: 'Europe/Moscow' })
    ).toBe(true)
  })
})
