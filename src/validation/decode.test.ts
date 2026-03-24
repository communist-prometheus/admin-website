import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { decodeOrDefault, decodeOrUndefined, parseJsonAs } from './decode'

const Num = Schema.Number

/** Tests for decode helpers with Effect Schema. */
describe('decodeOrUndefined', () => {
  it('returns value for valid input', () => {
    expect(decodeOrUndefined(Num)(42)).toBe(42)
  })

  it('returns undefined for invalid input', () => {
    expect(decodeOrUndefined(Num)('nope')).toBeUndefined()
  })
})

/** Tests for decodeOrDefault fallback behavior. */
describe('decodeOrDefault', () => {
  it('returns value for valid input', () => {
    expect(decodeOrDefault(Num, 0)(7)).toBe(7)
  })

  it('returns fallback for invalid input', () => {
    expect(decodeOrDefault(Num, 0)('bad')).toBe(0)
  })
})

/** Tests for JSON parsing with schema validation. */
describe('parseJsonAs', () => {
  it('parses valid JSON matching schema', () => {
    expect(parseJsonAs(Num)('42')).toBe(42)
  })

  it('returns undefined for invalid JSON', () => {
    expect(parseJsonAs(Num)('{broken')).toBeUndefined()
  })

  it('returns undefined when schema rejects parsed value', () => {
    expect(parseJsonAs(Num)('"text"')).toBeUndefined()
  })
})
