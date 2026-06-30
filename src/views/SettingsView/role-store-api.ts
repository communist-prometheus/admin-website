import { loadToken } from '@/composables/useAuth/token-storage'
import type { Role } from '@/types/role'
import { okOrThrow } from './sw-response'

/** KV-backed app-role grant map (login lists per role). */
export type RoleMap = Record<Role, readonly string[]>

const auth = (): Record<string, string> => ({
  Authorization: `Bearer ${loadToken() ?? ''}`,
})

const isMock = (): boolean => import.meta.env.VITE_MOCK_AUTH === 'true'

/**
 * Fetch the KV-backed role grant map from the worker (admin only).
 * Returns undefined on any failure so callers can keep the
 * server-provided roles instead of blanking them (e.g. mock mode or a
 * non-admin viewer where the endpoint 403s).
 * @returns The role map, or undefined when unavailable.
 */
export const fetchRoleMap = async (): Promise<RoleMap | undefined> => {
  const res = await fetch('/api/roles', { headers: auth() }).catch(
    () => undefined
  )
  return res?.ok ? ((await res.json()) as RoleMap) : undefined
}

const putRole = async (login: string, role: Role | 'none'): Promise<void> => {
  await okOrThrow(
    await fetch('/api/roles', {
      method: 'PUT',
      headers: { ...auth(), 'content-type': 'application/json' },
      body: JSON.stringify({ login, role }),
    })
  )
}

/**
 * Assign an app role to a login through the KV store (admin only). The
 * worker re-derives the caller's admin status from their own token.
 * Mock/E2E mode short-circuits to success (no worker/KV to call).
 * @param login - GitHub login.
 * @param role - New role, or 'none' to clear.
 * @returns Resolves when stored (or immediately in mock mode).
 */
export const setOrgRole = (
  login: string,
  role: Role | 'none'
): Promise<void> => (isMock() ? Promise.resolve() : putRole(login, role))
