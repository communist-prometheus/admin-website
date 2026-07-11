import { describe, expect, it } from 'vitest'
import { getFields } from './frontmatter-fields'

describe('getFields', () => {
  describe('blog', () => {
    it('returns blog fields including description and category select', () => {
      const fields = getFields('blog')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual([
        'title',
        'description',
        'category',
        'published',
        'publishDate',
        'magazine',
        'archive',
      ])
    })

    it('exposes description as an optional textarea', () => {
      const fields = getFields('blog')
      const description = fields.find(f => f.key === 'description')
      expect(description?.type).toBe('textarea')
      expect(description?.required).toBeUndefined()
    })

    it('exposes category as a required labels-sourced select', () => {
      const fields = getFields('blog')
      const category = fields.find(f => f.key === 'category')
      expect(category?.type).toBe('select')
      expect(category?.required).toBe(true)
      expect(
        category?.type === 'select' ? category.optionsSource : undefined
      ).toBe('labels')
    })
  })

  describe('magazine', () => {
    it('includes optional description', () => {
      const fields = getFields('magazine')
      const description = fields.find(f => f.key === 'description')
      expect(description?.type).toBe('textarea')
      expect(description?.required).toBeUndefined()
    })
  })

  describe('positions', () => {
    it('returns positions fields', () => {
      const fields = getFields('positions')
      const keys = fields.map(f => f.key)
      expect(keys).toEqual(['title', 'published', 'publishDate', 'archive'])
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
