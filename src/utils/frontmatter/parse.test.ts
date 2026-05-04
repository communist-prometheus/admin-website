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

  /*
   * `yaml` lib v2 keeps plain `YYYY-MM-DD` as strings (YAML 1.2 does
   * not auto-tag dates without an explicit `!!timestamp` tag). The
   * downstream schema accepts both — see frontmatter-blog.ts where
   * publishDate is `Schema.Union(Schema.String, Schema.DateFromSelf)`
   * — so leaving it a string everywhere is the simpler contract.
   */
  it('parses date-shaped values as strings (YAML 1.2 default)', () => {
    const markdown = `---
date: 2024-01-15
---
Content`

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.date).toBe('2024-01-15')
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

  it('parses CRLF line endings', () => {
    const markdown =
      '---\r\ntitle: Windows File\r\ncategory: test\r\n---\r\n\r\nBody line'

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.title).toBe('Windows File')
    expect(result.frontmatter.category).toBe('test')
    expect(result.content).toBe('Body line')
  })

  it('parses frontmatter when file has no trailing newline', () => {
    const markdown = '---\ntitle: X\nlang: en\n---\nBody'

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.title).toBe('X')
    expect(result.frontmatter.lang).toBe('en')
    expect(result.content).toBe('Body')
  })

  /*
   * Regression: from-manchester-to-global/index.it.md took prod red
   * for two days because the description contained "predatoria: ha
   * semplicemente" and the previous self-rolled splitter saw two
   * keys ("predatoria") with bad indentation. Quoted descriptions
   * must round-trip cleanly.
   */
  it('parses a quoted description containing colons', () => {
    const markdown = [
      '---',
      'title: Article',
      `description: 'Capital has not changed: it just scaled up'`,
      'lang: it',
      '---',
      'Body',
    ].join('\n')

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.description).toBe(
      'Capital has not changed: it just scaled up'
    )
    expect(result.frontmatter.title).toBe('Article')
  })

  it('parses a folded block scalar (>-) description', () => {
    const markdown = [
      '---',
      'title: Article',
      'description: >-',
      '  Capital has not changed: it just scaled the conditions',
      '  of 19th-century Manchester to the entire planet.',
      'lang: it',
      '---',
      'Body',
    ].join('\n')

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter.description).toBe(
      'Capital has not changed: it just scaled the conditions of 19th-century Manchester to the entire planet.'
    )
  })

  it('returns empty frontmatter when YAML is malformed', () => {
    const markdown = '---\ntitle: A\n  bad: indent\nweird:\n---\nBody'

    const result = parseFrontmatter(markdown)

    expect(result.frontmatter).toEqual({})
    expect(result.content).toBe('Body')
  })
})
