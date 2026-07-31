import { dead, renewOnce } from './renew-session'
import {
  canRefresh,
  type GitHubSession,
  isExpired,
  needsRefresh,
} from './session'
import { loadSession } from './session-storage'

/** Renew this many ms before the access token actually expires. */
const SKEW_MS = 10 * 60 * 1000

/*
 * Within the skew window with no usable refresh token: clear only once the
 * token is genuinely past expiry — otherwise return it and let the app use
 * the remaining minutes.
 */
const withoutRefresh = (
  session: GitHubSession,
  now: number
): string | undefined =>
  isExpired(session, now) ? dead() : session.accessToken

const resolveFresh = (
  session: GitHubSession,
  now: number
): Promise<string | undefined> | string | undefined => {
  const refreshToken = session.refreshToken
  return needsRefresh(session, now, SKEW_MS)
    ? refreshToken && canRefresh(session, now)
      ? renewOnce(session, refreshToken, now)
      : withoutRefresh(session, now)
    : session.accessToken
}

/**
 * Return an access token guaranteed fresh for the immediate call, renewing
 * it via the refresh token when it is near or past expiry. Returns
 * undefined (and clears the session) only when the token is dead and cannot
 * be renewed — the caller should then route to login. Non-expiring/legacy
 * tokens are returned unchanged.
 * @param now - Current epoch ms (injectable for tests)
 * @returns A usable access token, or undefined when the session is dead
 */
export const ensureFreshToken = async (
  now = Date.now()
): Promise<string | undefined> => {
  const session = loadSession()
  return session ? resolveFresh(session, now) : undefined
}
