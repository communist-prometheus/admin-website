import { getAuthBase } from '@/config/auth-session'

/** Shape of the auth-worker `/auth/session` response. */
export type SessionPayload = {
  readonly login: string
  readonly roles: ReadonlyArray<string>
  readonly expires: number
}

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const isStringArray = (x: unknown): x is ReadonlyArray<string> =>
  Array.isArray(x) && x.every(item => typeof item === 'string')

const isSessionPayload = (value: unknown): value is SessionPayload =>
  isObject(value) &&
  typeof value['login'] === 'string' &&
  isStringArray(value['roles']) &&
  typeof value['expires'] === 'number'

/**
 * Trade a fresh GitHub OAuth token for an SSO session cookie scoped
 * to `.comprom.org`. The cookie itself is HttpOnly and not visible
 * here; the returned payload is the same data, suitable for
 * driving RBAC UI without touching the cookie.
 *
 * Returns undefined when the auth-worker rejects the token (401/403
 * — caller should fall back to PKCE) or the response shape is
 * unexpected. Never throws on auth-worker errors — only on network
 * failures.
 * @param ghToken GitHub OAuth access token from PKCE.
 * @returns Session metadata or undefined.
 */
export const mintSession = async (
  ghToken: string
): Promise<SessionPayload | undefined> => {
  const res = await fetch(`${getAuthBase()}/auth/session`, {
    method: 'POST',
    credentials: 'include',
    headers: { Authorization: `Bearer ${ghToken}` },
  })
  return res.ok ? readPayload(res) : undefined
}

const readPayload = async (
  res: Response
): Promise<SessionPayload | undefined> => {
  const body: unknown = await res.json().catch(() => undefined)
  return isSessionPayload(body) ? body : undefined
}

/**
 * Invalidate the SSO session cookie. Called from the logout UI.
 * @returns Nothing; fires-and-forgets on network errors.
 */
export const clearSession = async (): Promise<void> => {
  await fetch(`${getAuthBase()}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => undefined)
}
