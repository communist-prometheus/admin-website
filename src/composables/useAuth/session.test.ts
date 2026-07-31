import { describe, expect, it } from 'vitest'
import {
  canRefresh,
  type GitHubSession,
  needsRefresh,
  sessionFromResponse,
} from './session'

const NOW = 1_000_000_000_000

describe('sessionFromResponse', () => {
  it('anchors relative lifetimes to now', () => {
    const session = sessionFromResponse(
      {
        access_token: 'gho_a',
        refresh_token: 'ghr_a',
        expires_in: '28800',
        refresh_token_expires_in: '15897600',
      },
      NOW
    )
    expect(session).toEqual<GitHubSession>({
      accessToken: 'gho_a',
      refreshToken: 'ghr_a',
      expiresAt: NOW + 28_800 * 1000,
      refreshTokenExpiresAt: NOW + 15_897_600 * 1000,
    })
  })

  it('treats a token without expiry as non-expiring', () => {
    const session = sessionFromResponse({ access_token: 'gho_a' }, NOW)
    expect(session?.expiresAt).toBeUndefined()
    expect(session?.refreshTokenExpiresAt).toBeUndefined()
  })

  it('returns undefined for an error payload', () => {
    expect(
      sessionFromResponse({ error: 'bad_verification_code' }, NOW)
    ).toBeUndefined()
  })
})

describe('needsRefresh', () => {
  const base: GitHubSession = { accessToken: 'a', expiresAt: NOW + 60_000 }

  it('is true inside the skew window', () => {
    expect(needsRefresh(base, NOW, 120_000)).toBe(true)
  })

  it('is false with ample time left', () => {
    expect(needsRefresh(base, NOW, 30_000)).toBe(false)
  })

  it('is false for a non-expiring session', () => {
    expect(needsRefresh({ accessToken: 'a' }, NOW, 120_000)).toBe(false)
  })
})

describe('canRefresh', () => {
  it('requires a refresh token', () => {
    expect(canRefresh({ accessToken: 'a' }, NOW)).toBe(false)
  })

  it('is true while the refresh token is alive', () => {
    const session: GitHubSession = {
      accessToken: 'a',
      refreshToken: 'r',
      refreshTokenExpiresAt: NOW + 1000,
    }
    expect(canRefresh(session, NOW)).toBe(true)
  })

  it('is false once the refresh token has expired', () => {
    const session: GitHubSession = {
      accessToken: 'a',
      refreshToken: 'r',
      refreshTokenExpiresAt: NOW - 1000,
    }
    expect(canRefresh(session, NOW)).toBe(false)
  })
})
