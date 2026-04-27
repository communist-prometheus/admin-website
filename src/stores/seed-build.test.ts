import { describe, expect, it } from 'vitest'
import type { ContentItem } from '@/types/content'
import { buildSeed } from './seed-build'

const item = (
  slug: string,
  lang: string,
  extra: Record<string, unknown> = {}
): ContentItem => ({
  path: `pages/${slug}/index.${lang}.md`,
  slug,
  lang,
  frontmatter: { title: slug, lang, ...extra },
})

describe('buildSeed', () => {
  it('returns nothing when newLangs is empty', () => {
    expect(buildSeed('pages', [item('home', 'en')], [])).toEqual([])
  })

  it('returns nothing when items is empty', () => {
    expect(buildSeed('pages', [], ['de'])).toEqual([])
  })

  it('seeds one file per (slug × new lang) without existing translation', () => {
    const items = [item('home', 'en'), item('about', 'en')]
    const seeds = buildSeed('pages', items, ['de'])
    expect(seeds.map(s => s.path)).toEqual([
      'pages/home/index.de.md',
      'pages/about/index.de.md',
    ])
  })

  it('skips slugs that already have the new lang', () => {
    const items = [item('home', 'en'), item('home', 'de')]
    expect(buildSeed('pages', items, ['de'])).toEqual([])
  })

  it('seeds for two new langs at once', () => {
    const items = [item('home', 'en')]
    const seeds = buildSeed('pages', items, ['de', 'fr'])
    expect(seeds.map(s => s.path)).toEqual([
      'pages/home/index.de.md',
      'pages/home/index.fr.md',
    ])
  })

  it('clones template frontmatter and overrides lang', () => {
    const items = [
      item('home', 'en', { heroTitle: 'Welcome', latestNews: 'News' }),
    ]
    const seeds = buildSeed('pages', items, ['de'])
    expect(seeds[0]?.content).toContain('title: home')
    expect(seeds[0]?.content).toContain('heroTitle: Welcome')
    expect(seeds[0]?.content).toContain('latestNews: News')
    expect(seeds[0]?.content).toContain('lang: de')
    expect(seeds[0]?.content).not.toContain('lang: en')
  })

  it('prefers en as the template, falls back to first available', () => {
    const enFm = item('home', 'en', { heroTitle: 'EN' })
    const ruFm = item('home', 'ru', { heroTitle: 'RU' })
    const fromEn = buildSeed('pages', [enFm, ruFm], ['de'])
    expect(fromEn[0]?.content).toContain('heroTitle: EN')

    const fallback = buildSeed('pages', [ruFm], ['de'])
    expect(fallback[0]?.content).toContain('heroTitle: RU')
  })

  it('emits empty body separator', () => {
    const items = [item('home', 'en')]
    const seeds = buildSeed('pages', items, ['de'])
    expect(seeds[0]?.content.endsWith('---\n\n')).toBe(true)
  })
})
