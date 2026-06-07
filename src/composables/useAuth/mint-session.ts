import { getAuthBase } from '@/config/auth-session'
import { useAuthStore } from '@/stores/auth'
import { readPayload, type SessionPayload } from './session-payload'

export type { SessionPayload } from './session-payload'

const safeSetSsoRoles = (roles: readonly string[]): void => {
  try {
    useAuthStore().setSsoRoles(roles)
  } catch {
    // Pinia not ready (early-boot edge); store will sync next call.
  }
}

// Only write on a confirmed-success response. A failed mint (network
// hiccup, 5xx, 4xx from auth-worker, expired gh_token) must NOT
// clobber the previously-persisted roles — that was hiding the Comms
// entry from real owners. Successful responses always carry roles.
const writeRolesToStore = (payload: SessionPayload | undefined): void =>
  payload === undefined ? undefined : safeSetSsoRoles(payload.roles)

/**
 * Trade a fresh GitHub OAuth token for an SSO session cookie scoped
 * to `.comprom.org`. The cookie itself is HttpOnly and not visible
 * here; the returned payload is the same data, suitable for driving
 * RBAC UI without touching the cookie. On success, also pushes
 * `roles` into the auth store so nav / route guards can react.
 *
 * Returns undefined when the auth-worker rejects the token (401/403)
 * or the response shape is unexpected. Never throws on auth-worker
 * errors — only on network failures.
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
  const payload = res.ok ? await readPayload(res) : undefined
  writeRolesToStore(payload)
  return payload
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
  try {
    useAuthStore().clearSsoRoles()
  } catch {
    // Pinia not ready — harmless.
  }
}
