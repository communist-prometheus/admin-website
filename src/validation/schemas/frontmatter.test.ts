import { Either } from 'effect'
import { describe, expect, it } from 'vitest'
import { validateFrontmatter } from './frontmatter'

describe('validateFrontmatter', () => {
  it('accepts a minimal blog frontmatter', () => {
    const r = validateFrontmatter('blog', {
      title: 'T',
      description: 'D',
      category: 'C',
      lang: 'en',
    })
    expect(Either.isRight(r)).toBe(true)
  })

  it('rejects a blog with an empty title', () => {
    const r = validateFrontmatter('blog', {
      title: '',
      description: 'D',
      category: 'C',
      lang: 'en',
    })
    expect(Either.isLeft(r)).toBe(true)
  })

  it('rejects a blog missing required fields', () => {
    const r = validateFrontmatter('blog', { title: 'T', lang: 'en' })
    expect(Either.isLeft(r)).toBe(true)
  })

  it('rejects a positions missing description', () => {
    const r = validateFrontmatter('positions', {
      title: 'T',
      lang: 'en',
    })
    expect(Either.isLeft(r)).toBe(true)
  })

  it('accepts newspaper with optional publishDate', () => {
    const r = validateFrontmatter('newspaper', {
      title: 'T',
      description: 'D',
      lang: 'en',
      publishDate: '2026-04-20',
    })
    expect(Either.isRight(r)).toBe(true)
  })

  it('accepts a pages with title + lang only', () => {
    const r = validateFrontmatter('pages', { title: 'T', lang: 'en' })
    expect(Either.isRight(r)).toBe(true)
  })

  it('rejects pages missing title', () => {
    const r = validateFrontmatter('pages', { lang: 'en' })
    expect(Either.isLeft(r)).toBe(true)
  })

  it('accepts unknown types (common) without opinion', () => {
    const r = validateFrontmatter('common', { anything: 'goes' })
    expect(Either.isRight(r)).toBe(true)
  })
})
