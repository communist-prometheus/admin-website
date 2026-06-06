import { describe, expect, it } from 'vitest'
import { appendUtm, isoWeekString } from './utm'

describe('isoWeekString', () => {
  it('returns YYYY-WW with zero-padded week', () => {
    expect(isoWeekString(new Date('2026-01-01T12:00:00Z'))).toBe('2026-01')
    expect(isoWeekString(new Date('2026-06-04T12:00:00Z'))).toBe('2026-23')
    expect(isoWeekString(new Date('2026-12-31T12:00:00Z'))).toBe('2026-53')
  })

  it('honours ISO week-year boundary cases (early January and late December)', () => {
    expect(isoWeekString(new Date('2025-12-29T12:00:00Z'))).toBe('2026-01')
    expect(isoWeekString(new Date('2027-01-03T12:00:00Z'))).toBe('2026-53')
  })
})

describe('appendUtm', () => {
  it('appends the canonical campaign triple when the URL has no query', () => {
    const r = appendUtm('https://comprom.org/ru/articles/x/', '2026-23')
    expect(r).toBe(
      'https://comprom.org/ru/articles/x/?utm_source=newsletter&utm_medium=email&utm_campaign=2026-23'
    )
  })

  it('uses & when the URL already carries a query', () => {
    const r = appendUtm('https://comprom.org/ru/?ref=a', '2026-23')
    expect(r).toBe(
      'https://comprom.org/ru/?ref=a&utm_source=newsletter&utm_medium=email&utm_campaign=2026-23'
    )
  })
})
