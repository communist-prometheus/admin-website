import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'
import { LabelArraySchema, LabelEntrySchema } from './labels'

describe('LabelEntrySchema', () => {
  it('decodes valid entry', () => {
    const input = {
      key: 'tech',
      translations: { en: 'Technology', ru: 'Технологии' },
    }
    const result = Schema.decodeUnknownSync(LabelEntrySchema)(input)
    expect(result.key).toBe('tech')
    expect(result.translations.en).toBe('Technology')
  })

  it('rejects missing key', () => {
    expect(() =>
      Schema.decodeUnknownSync(LabelEntrySchema)({
        translations: { en: 'X' },
      })
    ).toThrow()
  })

  it('rejects missing translations', () => {
    expect(() =>
      Schema.decodeUnknownSync(LabelEntrySchema)({ key: 'x' })
    ).toThrow()
  })
})

describe('LabelArraySchema', () => {
  it('decodes valid array', () => {
    const input = [
      { key: 'a', translations: { en: 'A' } },
      { key: 'b', translations: { en: 'B', ru: 'Б' } },
    ]
    const result = Schema.decodeUnknownSync(LabelArraySchema)(input)
    expect(result).toHaveLength(2)
  })
})
