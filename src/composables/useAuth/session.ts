/**
 * A GitHub App user-to-server session. `accessToken` is the short-lived
 * (~8h) token; `refreshToken` renews it; the `*ExpiresAt` fields are
 * absolute epoch-ms deadlines. When the expiry fields are absent the
 * token is treated as non-expiring (legacy tokens, or an App with token
 * expiration opted out).
 */
export interface GitHubSession {
  readonly accessToken: string
  readonly refreshToken?: string
  readonly expiresAt?: number
  readonly refreshTokenExpiresAt?: number
}

/** The proxied `/api/oauth/token` response shape (scalars as strings). */
export interface TokenResponse {
  readonly access_token?: string
  readonly refresh_token?: string
  readonly expires_in?: string
  readonly refresh_token_expires_in?: string
  readonly error?: string
}

const deadline = (
  seconds: string | undefined,
  now: number
): number | undefined =>
  seconds === undefined ? undefined : now + Number(seconds) * 1000

/**
 * Build a session from a token response, anchoring relative lifetimes to
 * `now`. Returns undefined when the response carries no access token
 * (e.g. an error payload).
 * @param response - Proxied token response
 * @param now - Current epoch ms
 * @returns The session, or undefined when unusable
 */
export const sessionFromResponse = (
  response: TokenResponse,
  now: number
): GitHubSession | undefined =>
  response.access_token
    ? {
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: deadline(response.expires_in, now),
        refreshTokenExpiresAt: deadline(
          response.refresh_token_expires_in,
          now
        ),
      }
    : undefined

/**
 * Whether the access token expires within `skewMs` and should be renewed
 * proactively. Non-expiring sessions never need a refresh.
 * @param session - Current session
 * @param now - Current epoch ms
 * @param skewMs - Renew-ahead window
 * @returns True when a proactive refresh is due
 */
export const needsRefresh = (
  session: GitHubSession,
  now: number,
  skewMs: number
): boolean =>
  session.expiresAt !== undefined && session.expiresAt - now <= skewMs

/**
 * Whether a refresh is still possible: a refresh token exists and has not
 * itself expired.
 * @param session - Current session
 * @param now - Current epoch ms
 * @returns True when the refresh token can be exchanged
 */
export const canRefresh = (session: GitHubSession, now: number): boolean =>
  session.refreshToken !== undefined &&
  (session.refreshTokenExpiresAt === undefined ||
    session.refreshTokenExpiresAt > now)

/**
 * Whether the access token is already past its expiry (unusable now).
 * @param session - Current session
 * @param now - Current epoch ms
 * @returns True when the access token has expired
 */
export const isExpired = (session: GitHubSession, now: number): boolean =>
  session.expiresAt !== undefined && session.expiresAt <= now
