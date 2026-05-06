import { describe, expect, it } from 'vitest'
import type { ContentItem } from '@/types/content'
import { sortByDateNewestFirst } from './sort-by-date'

const item = (
  slug: string,
  frontmatter: Record<string, unknown>
): ContentItem => ({
  path: `content/blog/${slug}.md`,
  slug,
  lang: 'en',
  frontmatter,
})

describe('sortByDateNewestFirst', () => {
  it('orders newer publishDate first', () => {
    const older = item('a', { publishDate: '2024-01-01' })
    const newer = item('b', { publishDate: '2026-05-01' })
    const result = sortByDateNewestFirst([older, newer])
    expect(result.map(i => i.slug)).toEqual(['b', 'a'])
  })

  it('sinks items without a date to the bottom', () => {
    const dated = item('a', { publishDate: '2024-01-01' })
    const undated = item('b', { title: 'no date' })
    const result = sortByDateNewestFirst([undated, dated])
    expect(result.map(i => i.slug)).toEqual(['a', 'b'])
  })

  it('tie-breaks by slug when both items have no date', () => {
    const x = item('zebra', {})
    const y = item('apple', {})
    const result = sortByDateNewestFirst([x, y])
    expect(result.map(i => i.slug)).toEqual(['apple', 'zebra'])
  })

  it('accepts the legacy pubDate field as a fallback', () => {
    const legacy = item('legacy', { pubDate: '2026-04-01' })
    const modern = item('modern', { publishDate: '2026-01-01' })
    const result = sortByDateNewestFirst([modern, legacy])
    expect(result.map(i => i.slug)).toEqual(['legacy', 'modern'])
  })

  it('treats invalid date strings as missing', () => {
    const bad = item('bad', { publishDate: 'not-a-date' })
    const good = item('good', { publishDate: '2026-01-01' })
    const result = sortByDateNewestFirst([bad, good])
    expect(result.map(i => i.slug)).toEqual(['good', 'bad'])
  })

  it('accepts Date instances directly', () => {
    const a = item('a', { publishDate: new Date('2024-06-01') })
    const b = item('b', { publishDate: new Date('2026-06-01') })
    const result = sortByDateNewestFirst([a, b])
    expect(result.map(i => i.slug)).toEqual(['b', 'a'])
  })

  it('does not mutate its input', () => {
    const input: readonly ContentItem[] = [
      item('a', { publishDate: '2024-01-01' }),
      item('b', { publishDate: '2026-01-01' }),
    ]
    const snapshot = input.map(i => i.slug)
    sortByDateNewestFirst(input)
    expect(input.map(i => i.slug)).toEqual(snapshot)
  })
})
