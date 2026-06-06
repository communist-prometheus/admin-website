import { describe, expect, it } from 'vitest'
import { humaniseCron } from './humanise-cron'

describe('humaniseCron', () => {
  it('handles every-minute', () => {
    expect(humaniseCron('* * * * *')).toBe('every minute')
  })

  it('handles every-N-minutes', () => {
    expect(humaniseCron('*/15 * * * *')).toBe('every 15 minutes')
  })

  it('handles hourly at a fixed minute', () => {
    expect(humaniseCron('30 * * * *')).toBe('every hour at minute 30')
  })

  it('handles daily at HH:MM', () => {
    expect(humaniseCron('5 8 * * *')).toBe('every day at 08:05')
  })

  it('handles weekly on a named day at HH:MM', () => {
    expect(humaniseCron('0 12 * * 6')).toBe('every Saturday at 12:00')
  })

  it('handles weekly on Sunday with cron index 0', () => {
    expect(humaniseCron('30 9 * * 0')).toBe('every Sunday at 09:30')
  })

  it('handles weekly on Sunday with cron index 7 (alias)', () => {
    expect(humaniseCron('30 9 * * 7')).toBe('every Sunday at 09:30')
  })

  it('trims surrounding whitespace before matching', () => {
    expect(humaniseCron('   0 12 * * 6   ')).toBe('every Saturday at 12:00')
  })

  it('falls through to the raw expression for unmatched patterns', () => {
    expect(humaniseCron('0 12 1 * *')).toBe('0 12 1 * *')
  })
})
