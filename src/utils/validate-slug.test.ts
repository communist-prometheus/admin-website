import { describe, expect, it } from 'vitest'
import { validateSlug } from './validate-slug'

describe('validateSlug', () => {
  it('accepts valid slugs', () => {
    expect(validateSlug('hello')).toBeUndefined()
    expect(validateSlug('my-post')).toBeUndefined()
    expect(validateSlug('a1b2c3')).toBeUndefined()
  })

  it('rejects empty string', () => {
    expect(validateSlug('')).toBe('Slug cannot be empty')
  })

  it('rejects strings over 20 chars', () => {
    expect(validateSlug('a'.repeat(21))).toBe('Max 20 characters')
  })

  it('rejects uppercase letters', () => {
    expect(validateSlug('Hello')).toContain('Lowercase')
  })

  it('rejects special characters', () => {
    expect(validateSlug('hello_world')).toContain('Lowercase')
    expect(validateSlug('hello world')).toContain('Lowercase')
  })

  it('rejects slugs starting with digit', () => {
    expect(validateSlug('1abc')).toContain('must start with letter')
  })

  it('rejects slugs starting with hyphen', () => {
    expect(validateSlug('-abc')).toContain('must start with letter')
  })
})
