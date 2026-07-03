import { describe, expect, it } from 'vitest'
import { shouldOfferUsernameFallback, usernameGuess } from './invite-error'

describe('shouldOfferUsernameFallback', () => {
  /*
   * Fallback is meant to surface after a failed email-based invite so the
   * editor can retry as a username. It must NOT surface when the input is
   * already a username (the retry would target the same string) nor when
   * there is no error yet.
   */
  it('is true when the input is an email AND an error is present', () => {
    expect(shouldOfferUsernameFallback('a@b.com', 'boom')).toBe(true)
  })

  it('is false when there is no error yet', () => {
    expect(shouldOfferUsernameFallback('a@b.com', undefined)).toBe(false)
  })

  it('is false when the input is a bare username (no @)', () => {
    expect(shouldOfferUsernameFallback('undeadliner', 'boom')).toBe(false)
  })

  it('is false when the input is empty', () => {
    expect(shouldOfferUsernameFallback('', 'boom')).toBe(false)
  })

  it('is false when @ is at the edges (malformed)', () => {
    expect(shouldOfferUsernameFallback('@foo', 'boom')).toBe(false)
    expect(shouldOfferUsernameFallback('foo@', 'boom')).toBe(false)
  })

  it('trims whitespace before checking', () => {
    expect(shouldOfferUsernameFallback('  a@b.com  ', 'boom')).toBe(true)
  })
})

describe('usernameGuess', () => {
  it('returns the local part of an email', () => {
    expect(usernameGuess('undeadliner@proton.me')).toBe('undeadliner')
  })

  it('returns the input unchanged when there is no @', () => {
    expect(usernameGuess('undeadliner')).toBe('undeadliner')
  })

  it('returns empty string on empty or all-whitespace input', () => {
    expect(usernameGuess('')).toBe('')
    expect(usernameGuess('   ')).toBe('')
  })

  it('returns empty string when @ is at the start', () => {
    expect(usernameGuess('@leading')).toBe('')
  })
})
