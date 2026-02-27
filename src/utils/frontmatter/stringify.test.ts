import { describe, expect, it } from 'vitest'
import { stringifyFrontmatter } from './stringify'

describe('stringifyFrontmatter', () => {
  it('stringifies frontmatter with string values', () => {
    const frontmatter = {
      title: 'Test Post',
      slug: 'test-post',
    }
    const content = 'Content here'

    const result = stringifyFrontmatter(frontmatter, content)

    expect(result).toBe(`---
title: Test Post
slug: test-post
---

Content here`)
  })

  it('stringifies frontmatter with date values', () => {
    const frontmatter = {
      date: new Date('2024-01-15'),
    }
    const content = 'Content'

    const result = stringifyFrontmatter(frontmatter, content)

    expect(result).toContain('date: 2024-01-15')
  })

  it('stringifies frontmatter with boolean values', () => {
    const frontmatter = {
      published: true,
      draft: false,
    }
    const content = 'Content'

    const result = stringifyFrontmatter(frontmatter, content)

    expect(result).toContain('published: true')
    expect(result).toContain('draft: false')
  })

  it('stringifies frontmatter with number values', () => {
    const frontmatter = {
      order: 42,
      views: 1000,
    }
    const content = 'Content'

    const result = stringifyFrontmatter(frontmatter, content)

    expect(result).toContain('order: 42')
    expect(result).toContain('views: 1000')
  })
})
