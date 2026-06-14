import { describe, expect, it } from 'vitest'
import type { ContentItem } from '@/types/content'
import { archiveOptions } from './archive-options'

const item = (slug: string, title?: string): ContentItem =>
  ({
    slug,
    path: `archive/${slug}/index.en.md`,
    frontmatter: title === undefined ? {} : { title },
  }) as unknown as ContentItem

describe('archiveOptions', () => {
  it('alphabetises by title', () => {
    const opts = archiveOptions([item('z', 'Zeta'), item('a', 'Alpha')])
    expect(opts.map(o => o.title)).toEqual(['Alpha', 'Zeta'])
  })

  it('falls back to the slug when no title', () => {
    const opts = archiveOptions([item('founding-documents')])
    expect(opts[0]).toEqual({
      slug: 'founding-documents',
      title: 'founding-documents',
    })
  })

  it('dedupes by slug, preferring a real title over the slug', () => {
    const opts = archiveOptions([
      item('docs'),
      item('docs', 'Founding Documents'),
    ])
    expect(opts).toHaveLength(1)
    expect(opts[0]?.title).toBe('Founding Documents')
  })
})
