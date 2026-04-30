import { describe, expect, it } from 'vitest'
import { parseTraceparent } from './parse-traceparent'

describe('parseTraceparent', () => {
  it('parses a well-formed traceparent', () => {
    const out = parseTraceparent(
      '00-0123456789abcdef0123456789abcdef-fedcba9876543210-01'
    )
    expect(out?.traceId).toBe('0123456789abcdef0123456789abcdef')
    expect(out?.spanId).toBe('fedcba9876543210')
  })

  it('returns undefined for malformed input', () => {
    expect(parseTraceparent('garbage')).toBeUndefined()
    expect(parseTraceparent('00-short-x-01')).toBeUndefined()
    expect(parseTraceparent(undefined)).toBeUndefined()
  })

  it('rejects unknown version', () => {
    expect(
      parseTraceparent(
        '01-0123456789abcdef0123456789abcdef-fedcba9876543210-01'
      )
    ).toBeUndefined()
  })
})
