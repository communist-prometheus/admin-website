import { deleteCookie, readCookie } from './cookie-token'
import type { GitHubSession } from './session'
import { clearMeta, loadMeta, saveMeta } from './session-meta'

/*
 * The access token stays under the historical `gh_token` key so every
 * existing reader (SW re-init, deploy status, RBAC calls, the route
 * guard) keeps reading a plain string. The refresh material and expiry
 * live in a sidecar meta key, so persisting a full session never changes
 * the token key's contract.
 */
const TOKEN_KEY = 'gh_token'

/**
 * Persist a session: the access token under the legacy key, the refresh
 * material alongside it. Overwrites any prior meta so a bare token
 * (dev/mock/legacy) correctly clears stale refresh data.
 * @param session - Session to store
 */
export const saveSession = (session: GitHubSession): void => {
  localStorage.setItem(TOKEN_KEY, session.accessToken)
  saveMeta({
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    refreshTokenExpiresAt: session.refreshTokenExpiresAt,
  })
}

const adoptCookie = (token: string): string => {
  localStorage.setItem(TOKEN_KEY, token)
  deleteCookie(TOKEN_KEY)
  return token
}

/*
 * Legacy fallback: a token minted before the sidecar existed may live
 * only in the parent-domain SSO cookie. Migrate it once into localStorage
 * and expire the cookie (it is an XSS-exfiltration target).
 */
const loadRawToken = (): string | undefined => {
  const stored = localStorage.getItem(TOKEN_KEY) ?? undefined
  const fromCookie = stored ? undefined : (readCookie(TOKEN_KEY) ?? undefined)
  return stored ?? (fromCookie ? adoptCookie(fromCookie) : undefined)
}

/**
 * Reconstruct the stored session from the token key plus sidecar meta.
 * A token with no meta reads back as a non-expiring session.
 * @returns The session, or undefined when no token is stored
 */
export const loadSession = (): GitHubSession | undefined => {
  const accessToken = loadRawToken()
  return accessToken ? { accessToken, ...loadMeta() } : undefined
}

/** Remove the token, its sidecar meta, and the legacy cookie. */
export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  clearMeta()
  deleteCookie(TOKEN_KEY)
}
