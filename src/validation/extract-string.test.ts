import { describe, expect, it } from 'vitest'
import { extractString } from './extract-string'

/** Tests for Vue route query value extraction. */
describe('extractString', () => {
  it('returns string from string input', () => {
    expect(extractString('hello')).toBe('hello')
  })

  it('returns first string from array', () => {
    expect(extractString(['a', 'b'])).toBe('a')
  })

  it('returns undefined from null', () => {
    expect(extractString(null)).toBeUndefined()
  })

  it('returns undefined from undefined', () => {
    expect(extractString(undefined)).toBeUndefined()
  })

  it('returns undefined from empty array', () => {
    expect(extractString([])).toBeUndefined()
  })
})
