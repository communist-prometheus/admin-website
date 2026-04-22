import { describe, expect, it } from 'vitest'
import { willPublish } from './will-publish'

describe('willPublish', () => {
  it('returns true for pages regardless of frontmatter', () => {
    expect(willPublish('pages', {})).toBe(true)
    expect(willPublish('pages', { published: false })).toBe(true)
  })

  it('returns true for common (auto-public)', () => {
    expect(willPublish('common', {})).toBe(true)
  })

  it('returns true for blog when published flag is on', () => {
    expect(willPublish('blog', { published: true })).toBe(true)
  })

  it('returns false for blog when published flag is missing', () => {
    expect(willPublish('blog', {})).toBe(false)
  })

  it('returns false for blog when published flag is off', () => {
    expect(willPublish('blog', { published: false })).toBe(false)
  })

  it('returns true for positions when published is on', () => {
    expect(willPublish('positions', { published: true })).toBe(true)
  })

  it('returns false for newspaper when published is off', () => {
    expect(willPublish('newspaper', { published: false })).toBe(false)
  })

  it('ignores non-boolean truthy "published" values', () => {
    expect(willPublish('blog', { published: 'yes' })).toBe(false)
  })
})
