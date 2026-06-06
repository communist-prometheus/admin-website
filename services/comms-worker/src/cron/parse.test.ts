import { describe, expect, it } from 'vitest'
import type { Schedule } from './matcher'
import { nextRunAt, validateCron } from './parse'

const MSK: Schedule = { cron: '0 12 * * 6', timezone: 'Europe/Moscow' }

describe('validateCron', () => {
  it('accepts a valid 5-field expression', () => {
    expect(validateCron('0 12 * * 6')).toEqual({ ok: true })
  })

  it('rejects an unparseable expression with a non-empty parser message', () => {
    const r = validateCron('not a cron')
    expect(r.ok).toBe(false)
    const error = 'error' in r ? r.error : ''
    expect(error.length).toBeGreaterThan(0)
  })

  it('rejects an out-of-range minute', () => {
    expect(validateCron('99 * * * *').ok).toBe(false)
  })
})

describe('nextRunAt', () => {
  it('returns the next ISO timestamp in UTC for the given schedule', () => {
    const r = nextRunAt(MSK, new Date('2026-06-01T00:00:00.000Z'))
    expect(r).toBe('2026-06-06T09:00:00.000Z')
  })

  it('returns the strictly-next fire even when called on a fire moment', () => {
    const r = nextRunAt(MSK, new Date('2026-06-06T09:00:00.000Z'))
    expect(r).toBe('2026-06-13T09:00:00.000Z')
  })

  it('honours IANA timezone (Etc/UTC daily at 00:00)', () => {
    const utc: Schedule = { cron: '0 0 * * *', timezone: 'Etc/UTC' }
    const r = nextRunAt(utc, new Date('2026-06-06T12:00:00.000Z'))
    expect(r).toBe('2026-06-07T00:00:00.000Z')
  })
})
