import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadToken } from './token-storage'

const setCookie = (value: string): void => {
  // biome-ignore lint/suspicious/noDocumentCookie: jsdom has no Cookie Store API; tests drive the legacy cookie path on purpose.
  document.cookie = `gh_token=${value}; path=/`
}

describe('loadToken cookie migration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    // biome-ignore lint/suspicious/noDocumentCookie: see setCookie above.
    document.cookie = 'gh_token=; max-age=0; path=/'
    localStorage.clear()
  })

  it('prefers the localStorage copy', () => {
    localStorage.setItem('gh_token', 'from-storage')
    setCookie('from-cookie')
    expect(loadToken()).toBe('from-storage')
  })

  it('migrates the cookie into localStorage', () => {
    setCookie('from-cookie')
    expect(loadToken()).toBe('from-cookie')
    expect(localStorage.getItem('gh_token')).toBe('from-cookie')
  })

  it('expires the cookie after migration', () => {
    setCookie('from-cookie')
    loadToken()
    expect(document.cookie).not.toContain('gh_token=from-cookie')
  })

  it('returns undefined when neither store has a token', () => {
    expect(loadToken()).toBeUndefined()
  })
})
