import { describe, expect, it } from 'vitest'
import { pickLang } from './accept-language'

describe('pickLang — supported direct hits', () => {
  it('returns the single direct lang code when supported', () => {
    expect(pickLang('ru')).toBe('ru')
    expect(pickLang('en')).toBe('en')
    expect(pickLang('it')).toBe('it')
  })

  it('strips the region tag (ru-RU → ru)', () => {
    expect(pickLang('ru-RU')).toBe('ru')
    expect(pickLang('en-US')).toBe('en')
  })
})

describe('pickLang — quality-weighted preferences', () => {
  it('picks the highest-q supported entry', () => {
    expect(pickLang('fr;q=0.9,ru;q=0.8,en;q=0.1')).toBe('ru')
  })

  it('respects order when all q values are equal', () => {
    expect(pickLang('it,es,en')).toBe('it')
  })

  it('skips entries explicitly suppressed with q=0', () => {
    expect(pickLang('ru;q=0,en;q=0.5')).toBe('en')
  })

  it('parses Accept-Language tolerant of whitespace', () => {
    expect(pickLang(' ru-RU , en ; q=0.5 ')).toBe('ru')
  })
})

describe('pickLang — fallbacks', () => {
  it('falls back to English when nothing supported is offered', () => {
    expect(pickLang('fr,de;q=0.8')).toBe('en')
  })

  it('falls back to English when the header is absent or empty', () => {
    expect(pickLang(undefined)).toBe('en')
    expect(pickLang('')).toBe('en')
    expect(pickLang('   ')).toBe('en')
  })

  it('treats the catch-all "*" as English', () => {
    expect(pickLang('*')).toBe('en')
  })
})
