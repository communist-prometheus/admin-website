import { describe, expect, it } from 'vitest'
import { sanitizeSlug } from './sanitize-slug'

describe('sanitizeSlug', () => {
  it('keeps lowercase letters, digits, hyphens', () => {
    expect(sanitizeSlug('my-blog-2024')).toBe('my-blog-2024')
  })

  it('lowercases uppercase letters', () => {
    expect(sanitizeSlug('My-Blog-Post')).toBe('my-blog-post')
  })

  it('strips Cyrillic / non-Latin', () => {
    expect(sanitizeSlug('пост-test')).toBe('-test')
  })

  it('strips spaces and punctuation', () => {
    expect(sanitizeSlug('hello world!')).toBe('helloworld')
  })

  it('strips underscores (we use hyphens only)', () => {
    expect(sanitizeSlug('my_post')).toBe('mypost')
  })

  it('returns empty when nothing valid', () => {
    expect(sanitizeSlug('!!!')).toBe('')
    expect(sanitizeSlug('')).toBe('')
  })

  it('preserves multiple hyphens (deduping is not its job)', () => {
    expect(sanitizeSlug('a--b---c')).toBe('a--b---c')
  })
})
