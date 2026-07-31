import { refreshSession } from './exchange-token'
import { type GitHubSession, isExpired } from './session'
import { saveSession } from './session-storage'
import { clearToken } from './token-storage'

/**
 * Clear the dead session so the app forces an honest re-login.
 * @returns undefined, for use as an expression in the resolve chain
 */
export const dead = (): undefined => {
  clearToken()
  return undefined
}

/*
 * Renew failed: clear only a token already past expiry; otherwise keep the
 * still-valid token so a later attempt can renew within the remaining
 * window (this absorbs transient network blips).
 */
const onFailure = (
  session: GitHubSession,
  now: number
): string | undefined =>
  isExpired(session, now) ? dead() : session.accessToken

const renew = async (
  session: GitHubSession,
  refreshToken: string,
  now: number
): Promise<string | undefined> => {
  try {
    const next = await refreshSession(refreshToken)
    saveSession(next)
    return next.accessToken
  } catch {
    return onFailure(session, now)
  }
}

let inFlight: Promise<string | undefined> | undefined

/**
 * Renew the session, de-duplicating concurrent callers so a refresh-token
 * rotation happens exactly once. Without this, a second concurrent refresh
 * would reuse the now-invalidated refresh token, fail, and could clear the
 * session the first refresh just persisted.
 * @param session - Current session
 * @param refreshToken - Its refresh token
 * @param now - Current epoch ms
 * @returns The renewed access token, or undefined when the session died
 */
export const renewOnce = (
  session: GitHubSession,
  refreshToken: string,
  now: number
): Promise<string | undefined> => {
  inFlight ??= renew(session, refreshToken, now).finally(() => {
    inFlight = undefined
  })
  return inFlight
}
