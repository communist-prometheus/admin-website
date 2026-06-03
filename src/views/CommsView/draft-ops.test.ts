import { describe, expect, it } from 'vitest'
import { canSubmitNewSubscriber, toggleLang } from './draft-ops'

describe('canSubmitNewSubscriber', () => {
  it('accepts a valid email with at least one lang', () => {
    expect(canSubmitNewSubscriber('a@b.c', ['ru'])).toBe(true)
  })

  it('rejects a missing local-part', () => {
    expect(canSubmitNewSubscriber('@b.c', ['ru'])).toBe(false)
  })

  it('rejects a missing tld', () => {
    expect(canSubmitNewSubscriber('a@b', ['ru'])).toBe(false)
  })

  it('rejects when no langs are picked', () => {
    expect(canSubmitNewSubscriber('a@b.c', [])).toBe(false)
  })

  it('trims surrounding whitespace before checking', () => {
    expect(canSubmitNewSubscriber('  a@b.c  ', ['ru'])).toBe(true)
  })
})

describe('toggleLang', () => {
  it('adds a missing lang', () => {
    expect(toggleLang(['ru'], 'en')).toEqual(['ru', 'en'])
  })

  it('removes a present lang', () => {
    expect(toggleLang(['ru', 'en'], 'ru')).toEqual(['en'])
  })

  it('returns a new array (no mutation)', () => {
    const current = ['ru'] as const
    const next = toggleLang(current, 'en')
    expect(next).not.toBe(current)
  })
})
