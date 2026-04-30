import { describe, expect, it } from 'vitest'
import { formatCount } from './format-count'

describe('formatCount', () => {
  it('returns empty string for zero', () => {
    expect(formatCount(0)).toBe('')
  })

  it('returns the count verbatim for 1-9', () => {
    expect(formatCount(1)).toBe('1')
    expect(formatCount(9)).toBe('9')
  })

  it('returns the count verbatim for 10-99', () => {
    expect(formatCount(10)).toBe('10')
    expect(formatCount(99)).toBe('99')
  })

  it('caps at 99+ above the two-digit boundary', () => {
    expect(formatCount(100)).toBe('99+')
    expect(formatCount(9999)).toBe('99+')
  })

  it('clamps negatives and floors fractions', () => {
    expect(formatCount(-1)).toBe('')
    expect(formatCount(2.7)).toBe('2')
  })
})
