import { describe, expect, it } from 'vitest'
import {
  parseFrontmatter,
  parseFrontmatterStrict,
  serializeFrontmatter,
} from './frontmatter'

const FENCE = (yaml: string, body = 'B'): string =>
  `---\n${yaml}\n---\n${body}`

describe('serializeFrontmatter — round-trip safety', () => {
  /*
   * The previous self-rolled writer emitted `${key}: ${value}` with
   * no escaping. The from-manchester-to-global blog post had a
   * description containing 'predatoria: ha semplicemente' and that
   * single colon took prod red for two days. These round-trip cases
   * pin the fix.
   */
  const cases: ReadonlyArray<readonly [string, Record<string, unknown>]> = [
    [
      'colon-inside-description',
      {
        title: 'A',
        description: 'has not changed: it just scaled up',
        lang: 'it',
      },
    ],
    [
      'real-world-from-manchester',
      {
        title: 'Dalla Manchester di Engels alla Manchester Globale',
        description:
          "natura predatoria: ha semplicemente scalato le condizioni infernali, e negli anni '70 il capitalismo ha lanciato i meccanismi della rivincita globale: ha delocalizzato la produzione",
        category: 'Storia',
        published: true,
        lang: 'it',
      },
    ],
    [
      'leading-reserved-chars',
      {
        title: '- not a list',
        description: '? what about this',
        category: '[draft] working title',
        lang: 'en',
      },
    ],
    [
      'curly-and-straight-quotes-mixed',
      {
        title: "L'avvento dell’automazione",
        description:
          "un'umanitaria “società post-industriale” di pari opportunità",
        lang: 'it',
      },
    ],
    [
      'multiline-description',
      {
        title: 'X',
        description: 'first line\nsecond line\nthird line',
        lang: 'en',
      },
    ],
  ]

  for (const [name, fm] of cases) {
    it(`round-trips ${name}`, () => {
      const md = serializeFrontmatter(fm, 'Body')
      const back = parseFrontmatter(md)
      expect(back.frontmatter).toEqual(fm)
      expect(back.body).toBe('Body')
    })
  }

  it('drops undefined values', () => {
    const md = serializeFrontmatter(
      { title: 'A', description: undefined, lang: 'en' },
      'B'
    )
    expect(md).not.toContain('description')
    expect(md).toContain('title: A')
  })
})

describe('parseFrontmatterStrict — fails loud, not silent', () => {
  it('throws on missing fence', () => {
    expect(() => parseFrontmatterStrict('no frontmatter here')).toThrow(
      /fence/
    )
  })

  it('throws on malformed YAML inside the fence', () => {
    /* Unquoted description with a colon inside is the regression. */
    const md = FENCE(
      ['title: A', 'description: capital changed: scaled up'].join('\n')
    )
    expect(() => parseFrontmatterStrict(md)).toThrow()
  })

  it('throws when the parsed root is not a mapping', () => {
    const md = FENCE('- a\n- b')
    expect(() => parseFrontmatterStrict(md)).toThrow(/mapping/)
  })

  it('returns the mapping on valid input', () => {
    const md = FENCE(['title: A', 'lang: en'].join('\n'))
    expect(parseFrontmatterStrict(md)).toEqual({ title: 'A', lang: 'en' })
  })
})

describe('parseFrontmatter — soft fallback', () => {
  it('returns empty frontmatter on malformed YAML rather than throwing', () => {
    const md = FENCE('title: A\n  bad: indent\nweird:')
    const r = parseFrontmatter(md)
    expect(r.frontmatter).toEqual({})
    expect(r.body).toBe('B')
  })

  it('parses the body separately from the fence', () => {
    const md = '---\ntitle: A\nlang: en\n---\nHello world'
    const r = parseFrontmatter(md)
    expect(r.frontmatter.title).toBe('A')
    expect(r.body).toBe('Hello world')
  })
})
