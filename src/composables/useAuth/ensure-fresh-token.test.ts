import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureFreshToken } from './ensure-fresh-token'
import { refreshSession } from './exchange-token'
import type { GitHubSession } from './session'
import { loadSession, saveSession } from './session-storage'

vi.mock('./exchange-token', () => ({
  refreshSession: vi.fn(),
}))

const refreshMock = vi.mocked(refreshSession)
const NOW = 1_000_000_000_000
const MIN = 60_000

const store = (session: GitHubSession): void => saveSession(session)

describe('ensureFreshToken', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    localStorage.clear()
    refreshMock.mockReset()
  })

  it('returns undefined when no session is stored', async () => {
    expect(await ensureFreshToken(NOW)).toBeUndefined()
  })

  it('returns a non-expiring token without refreshing', async () => {
    store({ accessToken: 'legacy' })
    expect(await ensureFreshToken(NOW)).toBe('legacy')
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('returns a still-fresh token without refreshing', async () => {
    store({ accessToken: 'fresh', expiresAt: NOW + 30 * MIN })
    expect(await ensureFreshToken(NOW)).toBe('fresh')
    expect(refreshMock).not.toHaveBeenCalled()
  })

  it('de-duplicates concurrent refreshes into a single rotation', async () => {
    store({
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: NOW - MIN,
      refreshTokenExpiresAt: NOW + 1_000 * MIN,
    })
    refreshMock.mockResolvedValue({
      accessToken: 'new',
      refreshToken: 'r2',
      expiresAt: NOW + 480 * MIN,
    })
    const [a, b] = await Promise.all([
      ensureFreshToken(NOW),
      ensureFreshToken(NOW),
    ])
    // Single-flight: one rotation, both callers see the new token, and the
    // session survives (a second rotation would invalidate r1 and could
    // clear the just-persisted session).
    expect(refreshMock).toHaveBeenCalledTimes(1)
    expect([a, b]).toEqual(['new', 'new'])
    expect(loadSession()?.accessToken).toBe('new')
  })

  it('renews and persists a near-expiry token', async () => {
    store({
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: NOW + 2 * MIN,
      refreshTokenExpiresAt: NOW + 1_000 * MIN,
    })
    refreshMock.mockResolvedValue({
      accessToken: 'new',
      refreshToken: 'r2',
      expiresAt: NOW + 480 * MIN,
    })
    expect(await ensureFreshToken(NOW)).toBe('new')
    expect(refreshMock).toHaveBeenCalledWith('r1')
    expect(loadSession()?.accessToken).toBe('new')
    expect(loadSession()?.refreshToken).toBe('r2')
  })

  it('clears the session when the refresh token itself has expired', async () => {
    store({
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: NOW - MIN,
      refreshTokenExpiresAt: NOW - MIN,
    })
    expect(await ensureFreshToken(NOW)).toBeUndefined()
    expect(refreshMock).not.toHaveBeenCalled()
    expect(loadSession()).toBeUndefined()
  })

  it('keeps the still-valid token when a refresh attempt fails transiently', async () => {
    store({
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: NOW + 2 * MIN,
      refreshTokenExpiresAt: NOW + 1_000 * MIN,
    })
    refreshMock.mockRejectedValue(new Error('network'))
    expect(await ensureFreshToken(NOW)).toBe('old')
    expect(loadSession()?.accessToken).toBe('old')
  })

  it('clears the session when refresh fails and the token is already expired', async () => {
    store({
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: NOW - MIN,
      refreshTokenExpiresAt: NOW + 1_000 * MIN,
    })
    refreshMock.mockRejectedValue(new Error('bad_refresh_token'))
    expect(await ensureFreshToken(NOW)).toBeUndefined()
    expect(loadSession()).toBeUndefined()
  })
})
