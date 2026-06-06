import { describe, expect, it } from 'vitest'
import { matchesTick, type Schedule, TICK_WINDOW_MS } from './matcher'

const MSK: Schedule = { cron: '0 12 * * 6', timezone: 'Europe/Moscow' }
const BERLIN: Schedule = { cron: '0 12 * * *', timezone: 'Europe/Berlin' }

describe('TICK_WINDOW_MS', () => {
  it('is five minutes', () => {
    expect(TICK_WINDOW_MS).toBe(5 * 60 * 1000)
  })
})

describe('matchesTick — canonical Saturday-noon Europe/Moscow', () => {
  it('matches an on-time heartbeat at 09:00Z on Saturday 2026-06-06', () => {
    expect(matchesTick(MSK, new Date('2026-06-06T09:00:00.000Z'))).toBe(true)
  })

  it('does not match the same hour on Friday 2026-06-05', () => {
    expect(matchesTick(MSK, new Date('2026-06-05T09:00:00.000Z'))).toBe(false)
  })

  it('matches a heartbeat 2 minutes late (inside window)', () => {
    expect(matchesTick(MSK, new Date('2026-06-06T09:02:00.000Z'))).toBe(true)
  })

  it('does not match a heartbeat 6 minutes late (outside window)', () => {
    expect(matchesTick(MSK, new Date('2026-06-06T09:06:00.000Z'))).toBe(false)
  })
})

describe('matchesTick — DST behaviour in Europe/Berlin', () => {
  it('matches CEST summer noon (10:00Z = 12:00 Berlin DST)', () => {
    expect(matchesTick(BERLIN, new Date('2026-06-06T10:00:00.000Z'))).toBe(
      true
    )
    expect(matchesTick(BERLIN, new Date('2026-06-06T11:00:00.000Z'))).toBe(
      false
    )
  })

  it('matches CET winter noon (11:00Z = 12:00 Berlin standard)', () => {
    expect(matchesTick(BERLIN, new Date('2026-12-06T11:00:00.000Z'))).toBe(
      true
    )
    expect(matchesTick(BERLIN, new Date('2026-12-06T10:00:00.000Z'))).toBe(
      false
    )
  })
})
