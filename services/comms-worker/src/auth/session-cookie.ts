/**
 * Cookie reader for the `comprom_session` parent-domain cookie that
 * auth-worker sets. Kept inside the comms-worker bundle (rather than
 * shared) because cross-service shared sources couple deploy
 * cadence — see docs/architecture/sso.md §9.
 */

/** Canonical cookie name — MUST match auth-worker. */
export const SESSION_COOKIE = 'comprom_session'

/**
 * Pull the session cookie value out of a raw `Cookie:` request
 * header. Returns undefined when the cookie is absent or the
 * header itself is missing/empty.
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
