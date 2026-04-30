import { describe, expect, it } from 'vitest'
import { backoffMs, MAX_ATTEMPTS, shouldRetry } from './retry-policy'

describe('shouldRetry', () => {
  it('returns true for retriable reasons under the cap', () => {
    expect(shouldRetry('network', 0)).toBe(true)
    expect(shouldRetry('network', MAX_ATTEMPTS - 1)).toBe(true)
    expect(shouldRetry('unknown', 1)).toBe(true)
  })

  it('returns false at or beyond the cap', () => {
    expect(shouldRetry('network', MAX_ATTEMPTS)).toBe(false)
    expect(shouldRetry('network', MAX_ATTEMPTS + 5)).toBe(false)
  })

  it('returns false for non-retriable reasons', () => {
    expect(shouldRetry('auth', 0)).toBe(false)
    expect(shouldRetry('non-fast-forward', 0)).toBe(false)
    expect(shouldRetry('validation', 0)).toBe(false)
  })
})

describe('backoffMs', () => {
  it('returns the configured delay per attempt', () => {
    expect(backoffMs(1)).toBe(2_000)
    expect(backoffMs(2)).toBe(4_000)
    expect(backoffMs(3)).toBe(8_000)
    expect(backoffMs(4)).toBe(16_000)
    expect(backoffMs(5)).toBe(32_000)
  })

  it('clamps to the largest delay for unexpected attempts', () => {
    expect(backoffMs(0)).toBe(2_000)
    expect(backoffMs(99)).toBe(32_000)
  })
})
