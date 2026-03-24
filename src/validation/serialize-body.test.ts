import { describe, expect, it } from 'vitest'
import { serializeBody } from './serialize-body'

/** Tests for BodyInit serialization to string. */
describe('serializeBody', () => {
  it('returns undefined for null', () => {
    expect(serializeBody(null)).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    expect(serializeBody(undefined)).toBeUndefined()
  })

  it('returns string for string input', () => {
    expect(serializeBody('payload')).toBe('payload')
  })

  it('returns string for URLSearchParams', () => {
    const params = new URLSearchParams({ a: '1', b: '2' })
    expect(serializeBody(params)).toBe('a=1&b=2')
  })
})
