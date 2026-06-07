/** Canonical cookie name used by every *.comprom.org worker. */
export const SESSION_COOKIE = 'comprom_session'

export type CookieConfig = {
  readonly domain: string
  readonly maxAgeSeconds: number
}

/**
 * Build the `Set-Cookie` value for a newly minted session token.
 * HttpOnly + Secure + SameSite=Lax keep XSS out of the cookie while
 * still allowing first-party fetches across *.comprom.org subdomains.
 * @param token Signed JWT to put in the cookie value.
 * @param cfg Cookie scope + lifetime.
 * @returns Header value suitable for `Set-Cookie:`.
 */
export const buildSessionCookie = (
  token: string,
  cfg: CookieConfig
): string =>
  [
    `${SESSION_COOKIE}=${token}`,
    `Domain=${cfg.domain}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${cfg.maxAgeSeconds}`,
  ].join('; ')

/**
 * Build the `Set-Cookie` value that invalidates the session on the
 * client. Same Domain/Path is mandatory — without them the browser
 * will not match the original cookie to delete.
 * @param domain Cookie scope (`.comprom.org`).
 * @returns Header value suitable for `Set-Cookie:` on logout.
 */
export const buildLogoutCookie = (domain: string): string =>
  [
    `${SESSION_COOKIE}=`,
    `Domain=${domain}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; ')

/**
 * Pull the session cookie value out of a raw `Cookie:` request header.
 * Returns undefined when the cookie is absent or the header is missing.
 * @param header Raw `Cookie:` header value.
 * @returns Token string, or undefined.
 */
export const readSessionCookie = (
  header: string | undefined
): string | undefined => {
  if (header === undefined || header === '') return undefined
  const entries = header.split(';').map(p => p.trim())
  const match = entries.find(p => p.startsWith(`${SESSION_COOKIE}=`))
  return match === undefined
    ? undefined
    : match.slice(SESSION_COOKIE.length + 1)
}
