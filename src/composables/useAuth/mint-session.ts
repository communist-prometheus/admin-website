import { getAuthBase } from '@/config/auth-session'
import {
  clearSsoRolesStorage,
  saveSsoRoles,
} from '@/stores/sso-roles-storage'
import { readPayload, type SessionPayload } from './session-payload'
import { notifySsoRoles } from './session-roles'

export type { SessionPayload } from './session-payload'

/*
 * Persist first, then announce. Persistence is what lets the next boot
 * resolve owner-gated nav synchronously; the announcement is for whatever
 * UI layer is listening right now. Neither step may drag a framework in
 * here — that is what made a Lit app depend on pinia.
 */
const publishSsoRoles = (roles: readonly string[]): void => {
  saveSsoRoles(roles)
  notifySsoRoles(roles)
}

// Only write on a confirmed-success response. A failed mint (network
// hiccup, 5xx, 4xx from auth-worker, expired gh_token) must NOT
// clobber the previously-persisted roles — that was hiding the Comms
// entry from real owners. Successful responses always carry roles.
const writeRolesToStore = (payload: SessionPayload | undefined): void =>
  payload === undefined ? undefined : publishSsoRoles(payload.roles)

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
  clearSsoRolesStorage()
  notifySsoRoles([])
}
