import { describe, expect, it } from 'vitest'
import { normalizeHeaders } from './normalize-headers'

/** Tests for HeadersInit normalization to plain object. */
describe('normalizeHeaders', () => {
  it('returns empty object for undefined', () => {
    expect(normalizeHeaders()).toEqual({})
  })

  it('converts plain object unchanged', () => {
    const input = { 'content-type': 'text/plain' }
    expect(normalizeHeaders(input)).toEqual(input)
  })

  it('converts array-of-tuples to object', () => {
    const input: [string, string][] = [
      ['x-key', 'val1'],
      ['x-other', 'val2'],
    ]
    expect(normalizeHeaders(input)).toEqual({
      'x-key': 'val1',
      'x-other': 'val2',
    })
  })

  it('converts Headers instance to object', () => {
    const h = new Headers({ accept: 'application/json' })
    expect(normalizeHeaders(h)).toEqual({
      accept: 'application/json',
    })
  })
})
