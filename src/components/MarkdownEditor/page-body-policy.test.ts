import { describe, expect, it } from 'vitest'
import { hasBodyEditor } from './page-body-policy'

describe('hasBodyEditor', () => {
  it('hides body for the home landing page', () => {
    expect(hasBodyEditor('pages', 'home')).toBe(false)
  })

  it('hides body for blog-listing', () => {
    expect(hasBodyEditor('pages', 'blog-listing')).toBe(false)
  })

  it('hides body for positions-listing', () => {
    expect(hasBodyEditor('pages', 'positions-listing')).toBe(false)
  })

  it('keeps body for manifest', () => {
    expect(hasBodyEditor('pages', 'manifest')).toBe(true)
  })

  it('keeps body for about', () => {
    expect(hasBodyEditor('pages', 'about')).toBe(true)
  })

  it('keeps body for blog entries (body is rendered on detail page)', () => {
    expect(hasBodyEditor('blog', 'home')).toBe(true)
  })

  it('keeps body for positions entries (body is rendered)', () => {
    expect(hasBodyEditor('positions', 'whatever')).toBe(true)
  })

  it('hides body for newspaper (only list page exists, body unused)', () => {
    expect(hasBodyEditor('newspaper', 'issue-01')).toBe(false)
  })

  it('hides body for any common slug (translation tables only)', () => {
    expect(hasBodyEditor('common', 'menu')).toBe(false)
    expect(hasBodyEditor('common', 'labels')).toBe(false)
  })

  it('keeps body when slug is undefined (defensive default)', () => {
    expect(hasBodyEditor('pages', undefined)).toBe(true)
  })
})
