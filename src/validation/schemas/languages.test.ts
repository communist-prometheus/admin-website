import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { LanguageArraySchema, LanguageEntrySchema } from './languages'

const decodeEntry = Schema.decodeUnknownEither(LanguageEntrySchema)
const decodeArray = Schema.decodeUnknownEither(LanguageArraySchema)

/** Tests for language schema validation. */
describe('LanguageEntrySchema', () => {
  it('decodes valid entry', () => {
    const result = decodeEntry({ code: 'en', label: 'English' })
    expect(result._tag).toBe('Right')
  })

  it('rejects missing label', () => {
    const result = decodeEntry({ code: 'en' })
    expect(result._tag).toBe('Left')
  })
})

/** Tests for language array schema validation. */
describe('LanguageArraySchema', () => {
  it('decodes valid array', () => {
    const input = [
      { code: 'en', label: 'English' },
      { code: 'uk', label: 'Ukrainian' },
    ]
    const result = decodeArray(input)
    expect(result._tag).toBe('Right')
  })

  it('rejects malformed entries', () => {
    const result = decodeArray([{ code: 42 }])
    expect(result._tag).toBe('Left')
  })
})
