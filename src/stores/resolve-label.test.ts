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
  it('resolves by key', () => {
    expect(resolveLabel('tech', 'en', LABELS)).toBe('Technology')
    expect(resolveLabel('tech', 'ru', LABELS)).toBe('Технологии')
  })

  it('resolves legacy text to translation', () => {
    expect(resolveLabel('Technology', 'ru', LABELS)).toBe('Технологии')
    expect(resolveLabel('Технологии', 'en', LABELS)).toBe('Technology')
  })

  it('falls back to value when lang missing', () => {
    expect(resolveLabel('tech', 'fr', LABELS)).toBe('tech')
  })

  it('falls back to value when not found', () => {
    expect(resolveLabel('unknown', 'en', LABELS)).toBe('unknown')
  })

  it('falls back on empty labels', () => {
    expect(resolveLabel('tech', 'en', [])).toBe('tech')
  })
})
