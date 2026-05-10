import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './parse'
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

  /*
   * The previous self-rolled writer emitted `${key}: ${value}` with
   * no escaping. Any value containing ': ' produced YAML with
   * pseudo-keys, which Astro's parser rejected at build time and
   * took prod red. These tests pin the round-trip contract so the
   * regression cannot reappear unnoticed.
   */
  describe('round-trip — values with YAML-hostile characters', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['colon-in-text', 'capital has not changed: it just scaled up'],
      ['hash-in-text', 'see ticket #42 for details'],
      ['leading-dash', '- not a list item, a sentence'],
      ['leading-question', '? what'],
      ['leading-bracket', '[draft] working title'],
      [
        'curly-quotes-and-apostrophe',
        'un’umanitaria “società post-industriale”',
      ],
      [
        'multiline-paragraph',
        'first sentence.\nsecond sentence on a new line.',
      ],
      [
        'real-world-from-manchester',
        "Capital has not changed its predatory nature: it has simply scaled the infernal conditions of the 19th-century Manchester factory to the dimensions of the entire planet. Faced with the inexorable fall of the rate of profit in the '70s, capitalism launched the mechanisms of global revenge: it relocated physical production to the countries of the 'new' capitalism.",
      ],
      /*
       * The fuzz contract found this counterexample: a value
       * shaped " \n" (leading space then newline) was emitted as a
       * YAML block scalar (`|+`) which silently dropped the
       * leading space on parse. `blockQuote: false` keeps strings
       * in flow style so they round-trip losslessly.
       */
      ['leading-space-then-newline', ' \n'],
      ['tabs-then-newline', '\t\t'],
      ['only-whitespace-and-newlines', '   \n   '],
    ]
    for (const [name, value] of cases) {
      it(`round-trips ${name}`, () => {
        const fm = { title: 'T', description: value, lang: 'it' }
        const md = stringifyFrontmatter(fm, 'Body')
        const back = parseFrontmatter(md)
        expect(back.frontmatter).toEqual(fm)
      })
    }
  })

  it('writes Date values as YYYY-MM-DD, not as ISO timestamps', () => {
    const fm = {
      title: 'T',
      lang: 'en',
      publishDate: new Date('2026-04-30T12:34:56.000Z'),
    }
    const md = stringifyFrontmatter(fm, 'Body')
    expect(md).toContain('publishDate: 2026-04-30')
    expect(md).not.toContain('12:34:56')
  })
})
