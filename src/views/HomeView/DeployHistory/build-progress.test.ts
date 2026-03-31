import { describe, expect, it, vi } from 'vitest'
import { calcProgress, formatElapsed } from './build-progress'

describe('calcProgress', () => {
  it('returns 0 for undefined', () => {
    expect(calcProgress(undefined)).toBe(0)
  })

  it('returns ~50 at 60s', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const started = new Date(now - 60_000).toISOString()
    expect(calcProgress(started)).toBe(50)
    vi.useRealTimers()
  })

  it('clamps at 95', () => {
    const started = new Date(Date.now() - 300_000).toISOString()
    expect(calcProgress(started)).toBe(95)
  })
})

describe('formatElapsed', () => {
  it('returns empty for undefined', () => {
    expect(formatElapsed(undefined)).toBe('')
  })

  it('formats seconds', () => {
    const started = new Date(Date.now() - 30_000).toISOString()
    expect(formatElapsed(started)).toMatch(/^\d+s$/)
  })

  it('formats minutes', () => {
    const started = new Date(Date.now() - 90_000).toISOString()
    expect(formatElapsed(started)).toMatch(/^\d+m \d+s$/)
  })
})
