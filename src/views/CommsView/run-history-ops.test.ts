import { describe, expect, it } from 'vitest'
import { isFailedRun, shortTickAt, statusBadgeClass } from './run-history-ops'

describe('isFailedRun', () => {
  it('is true for status === "failed"', () => {
    expect(isFailedRun('failed')).toBe(true)
  })

  it('is false for every other status', () => {
    expect(isFailedRun('sent')).toBe(false)
    expect(isFailedRun('bounced')).toBe(false)
    expect(isFailedRun('complained')).toBe(false)
    expect(isFailedRun('skipped')).toBe(false)
  })
})

describe('statusBadgeClass', () => {
  it('returns the BEM-ish class for the status', () => {
    expect(statusBadgeClass('sent')).toBe('badge-sent')
    expect(statusBadgeClass('failed')).toBe('badge-failed')
    expect(statusBadgeClass('bounced')).toBe('badge-bounced')
    expect(statusBadgeClass('complained')).toBe('badge-complained')
    expect(statusBadgeClass('skipped')).toBe('badge-skipped')
  })
})

describe('shortTickAt', () => {
  it('returns YYYY-MM-DD HH:MM (UTC) for an ISO timestamp', () => {
    expect(shortTickAt('2026-06-06T09:00:00.000Z')).toBe('2026-06-06 09:00')
  })

  it('echoes the raw value when not a parseable date', () => {
    expect(shortTickAt('not-a-date')).toBe('not-a-date')
  })
})
