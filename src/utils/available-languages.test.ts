import { describe, expect, it } from 'vitest'
import type { ContentItem } from '@/types/content'
import { getAvailableLanguages } from './available-languages'

const makeItem = (slug: string, lang: ContentItem['lang']): ContentItem => ({
  path: `src/content/blog/${slug}.${lang}.md`,
  slug,
  lang,
  frontmatter: { title: slug, lang },
})

describe('getAvailableLanguages', () => {
  it('returns empty set when no items match', () => {
    const result = getAvailableLanguages([], 'test')
    expect(result.size).toBe(0)
  })

  it('returns languages for a matching slug', () => {
    const items = [
      makeItem('welcome', 'en'),
      makeItem('welcome', 'ru'),
      makeItem('other', 'it'),
    ]
    const result = getAvailableLanguages(items, 'welcome')
    expect(result).toEqual(new Set(['en', 'ru']))
  })

  it('ignores items with different slugs', () => {
    const items = [makeItem('other', 'en'), makeItem('other', 'es')]
    const result = getAvailableLanguages(items, 'welcome')
    expect(result.size).toBe(0)
  })

  it('handles single language', () => {
    const items = [makeItem('doc', 'it')]
    const result = getAvailableLanguages(items, 'doc')
    expect(result).toEqual(new Set(['it']))
  })
})
