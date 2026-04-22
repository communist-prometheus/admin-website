import { describe, expect, it } from 'vitest'
import { getFields } from './frontmatter-fields'

describe('getFields', () => {
  describe('blog', () => {
    it('returns blog fields', () => {
      const fields = getFields('blog')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual([
        'title',
        'description',
        'category',
        'published',
        'publishDate',
      ])
    })
  })

  describe('positions', () => {
    it('returns positions fields', () => {
      const fields = getFields('positions')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual([
        'title',
        'description',
        'published',
        'publishDate',
      ])
    })
  })

  describe('pages', () => {
    it('returns base page fields without slug', () => {
      const fields = getFields('pages')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual(['title', 'description'])
    })

    it('returns home-specific fields', () => {
      const fields = getFields('pages', 'home')
      const keys = fields.map(f => f.key)
      expect(keys).toContain('heroTitle')
      expect(keys).toContain('latestNews')
      expect(keys).toContain('viewAllPosts')
      expect(keys).not.toContain('heading')
      expect(keys).not.toContain('allCategory')
    })

    it('returns blog-listing fields', () => {
      const fields = getFields('pages', 'blog-listing')
      const keys = fields.map(f => f.key)
      expect(keys).toContain('heading')
      expect(keys).toContain('allCategory')
      expect(keys).not.toContain('heroTitle')
    })

    it('returns positions-listing fields', () => {
      const fields = getFields('pages', 'positions-listing')
      const keys = fields.map(f => f.key)
      expect(keys).toContain('heading')
      expect(keys).not.toContain('allCategory')
      expect(keys).not.toContain('heroTitle')
    })

    it('returns base fields for manifest', () => {
      const fields = getFields('pages', 'manifest')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual(['title', 'description'])
    })

    it('returns base fields for unknown slug', () => {
      const fields = getFields('pages', 'unknown-page')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual(['title', 'description'])
    })

    it('never includes readMore, viewAll, backToList', () => {
      for (const slug of [
        'home',
        'blog-listing',
        'positions-listing',
        'manifest',
      ]) {
        const keys = getFields('pages', slug).map(f => f.key)
        expect(keys).not.toContain('readMore')
        expect(keys).not.toContain('viewAll')
        expect(keys).not.toContain('backToList')
      }
    })
  })

  describe('common', () => {
    it('returns menu fields', () => {
      const fields = getFields('common', 'menu')
      const keys = fields.map(f => f.key)
      expect(keys).toContain('home')
      expect(keys).toContain('blog')
      expect(keys).toContain('copyright')
    })

    it('returns labels fields', () => {
      const fields = getFields('common', 'labels')
      const keys = fields.map(f => f.key)
      expect(keys).toContain('readMore')
      expect(keys).toContain('viewAll')
      expect(keys).toContain('backToList')
    })

    it('returns labels fields without slug', () => {
      const fields = getFields('common')
      const keys = fields.map(f => f.key)
      expect(keys).toContain('readMore')
    })
  })
})
