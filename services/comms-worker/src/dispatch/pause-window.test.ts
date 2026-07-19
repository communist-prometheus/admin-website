import { describe, expect, it } from 'vitest'
import { nextUtcMidnight, nextUtcMonth, resumeAt } from './pause-window'

describe('nextUtcMidnight', () => {
  it('returns the next 00:00 UTC after a mid-day tick', () => {
    expect(
      nextUtcMidnight(new Date('2026-06-06T09:00:00.000Z')).toISOString()
    ).toBe('2026-06-07T00:00:00.000Z')
  })

  it('advances a full day even when the tick is at midnight', () => {
    expect(
      nextUtcMidnight(new Date('2026-06-06T00:00:00.000Z')).toISOString()
    ).toBe('2026-06-07T00:00:00.000Z')
  })

  it('rolls over month and year boundaries', () => {
    expect(
      nextUtcMidnight(new Date('2026-06-30T23:59:59.000Z')).toISOString()
    ).toBe('2026-07-01T00:00:00.000Z')
    expect(
      nextUtcMidnight(new Date('2026-12-31T12:00:00.000Z')).toISOString()
    ).toBe('2027-01-01T00:00:00.000Z')
  })
})

describe('nextUtcMonth', () => {
  it('returns the first instant of the next calendar month', () => {
    expect(
      nextUtcMonth(new Date('2026-06-06T09:00:00.000Z')).toISOString()
    ).toBe('2026-07-01T00:00:00.000Z')
  })

  it('rolls over the year boundary', () => {
    expect(
      nextUtcMonth(new Date('2026-12-15T09:00:00.000Z')).toISOString()
    ).toBe('2027-01-01T00:00:00.000Z')
  })
})

describe('resumeAt', () => {
  it('resolves a daily quota to the next UTC midnight', () => {
    expect(
      resumeAt('daily', new Date('2026-06-06T09:00:00.000Z')).toISOString()
    ).toBe('2026-06-07T00:00:00.000Z')
  })

  it('resolves a monthly quota to the next UTC month start', () => {
    expect(
      resumeAt('monthly', new Date('2026-06-06T09:00:00.000Z')).toISOString()
    ).toBe('2026-07-01T00:00:00.000Z')
  })
})
