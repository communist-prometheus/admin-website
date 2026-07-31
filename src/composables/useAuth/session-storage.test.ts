import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { GitHubSession } from './session'
import { clearSession, loadSession, saveSession } from './session-storage'

const FULL: GitHubSession = {
  accessToken: 'gho_a',
  refreshToken: 'ghr_a',
  expiresAt: 1_000_000,
  refreshTokenExpiresAt: 2_000_000,
}

describe('session-storage', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => localStorage.clear())

  it('round-trips a full session through both keys', () => {
    saveSession(FULL)
    expect(localStorage.getItem('gh_token')).toBe('gho_a')
    expect(loadSession()).toEqual(FULL)
  })

  it('reads a legacy token (no sidecar meta) as non-expiring', () => {
    localStorage.setItem('gh_token', 'legacy')
    expect(loadSession()).toEqual({ accessToken: 'legacy' })
  })

  it('overwrites stale refresh material when a bare token is saved', () => {
    saveSession(FULL)
    saveSession({ accessToken: 'plain' })
    expect(loadSession()).toEqual({ accessToken: 'plain' })
  })

  it('survives corrupt meta JSON', () => {
    localStorage.setItem('gh_token', 'tok')
    localStorage.setItem('gh_session_meta', '{not json')
    expect(loadSession()).toEqual({ accessToken: 'tok' })
  })

  it('clears both the token and its sidecar meta', () => {
    saveSession(FULL)
    clearSession()
    expect(loadSession()).toBeUndefined()
    expect(localStorage.getItem('gh_session_meta')).toBeNull()
  })
})
