import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './parse'

describe('parseFrontmatter', () => {
  it('parses frontmatter with string values', () => {
    const markdown = `---
title: Test Post
slug: test-post
---
Content here`

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter).toEqual({
      title: 'Test Post',
      slug: 'test-post',
    })
    expect(result.content).toBe('Content here')
  })

  it('parses frontmatter with date values', () => {
    const markdown = `---
date: 2024-01-15
---
Content`

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.date).toBeInstanceOf(Date)
    expect((result.frontmatter.date as Date).toISOString()).toContain(
      '2024-01-15'
    )
  })

  it('parses frontmatter with boolean values', () => {
    const markdown = `---
published: true
draft: false
---
Content`

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.published).toBe(true)
    expect(result.frontmatter.draft).toBe(false)
  })

  it('parses frontmatter with number values', () => {
    const markdown = `---
order: 42
views: 1000
---
Content`

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.order).toBe(42)
    expect(result.frontmatter.views).toBe(1000)
  })

  it('returns empty frontmatter when no frontmatter present', () => {
    const markdown = 'Just plain content'

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter).toEqual({})
    expect(result.content).toBe('Just plain content')
  })
})
