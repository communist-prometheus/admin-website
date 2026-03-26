import { describe, expect, it } from 'vitest'
import { resolveLabel } from './resolve-label'

const LABELS = [
  {
    key: 'tech',
    translations: { en: 'Technology', ru: 'Технологии' },
  },
  {
    key: 'news',
    translations: { en: 'News', ru: 'Новости' },
  },
]

describe('resolveLabel', () => {
  it('returns translation for matching key and lang', () => {
    expect(resolveLabel('tech', 'en', LABELS)).toBe('Technology')
    expect(resolveLabel('tech', 'ru', LABELS)).toBe('Технологии')
  })

  it('falls back to key when lang not found', () => {
    expect(resolveLabel('tech', 'fr', LABELS)).toBe('tech')
  })

  it('falls back to key when key not found', () => {
    expect(resolveLabel('missing', 'en', LABELS)).toBe('missing')
  })

  it('falls back to key on empty labels', () => {
    expect(resolveLabel('tech', 'en', [])).toBe('tech')
  })
})
