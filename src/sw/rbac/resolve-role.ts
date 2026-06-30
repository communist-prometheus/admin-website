import type { Role } from '@/types/role'
import { log } from '../logging/logger'
import { workerState } from '../state/state'
import { mockRoleFor } from './org-members-mock'

let cachedRole: Role | undefined

/** Clear the cached role (call on auth invalidate). */
export const invalidateRoles = (): void => {
  cachedRole = undefined
}

interface MeResponse {
  readonly role?: Role | null
}

const fetchMyRole = async (
  token: string | undefined
): Promise<Role | undefined> => {
  const res = token
    ? await fetch('/api/roles/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => undefined)
    : undefined
  const body: MeResponse = res?.ok ? await res.json().catch(() => ({})) : {}
  return body.role ?? undefined
}

/**
 * Fetch the current user's effective role from the CF worker
 * (`GET /api/roles/me`, KV-backed) with the stored token and cache it.
 * Replaces the former `.admin/roles.json` read so role changes apply
 * immediately without a content commit. Org admins resolve to `admin`
 * server-side. Called after each repo sync (fire-and-log).
 */
export const loadRoles = async (): Promise<void> => {
  const mock = __MOCK_MODE__ || workerState.config?.mock
  cachedRole = mock
    ? mockRoleFor(workerState.config?.username)
    : await fetchMyRole(workerState.config?.token)
  log('info', 'rbac', `role resolved: ${cachedRole ?? 'none'}`)
}

/**
 * Resolve the current user's role. The username argument is kept for
 * call-site compatibility; the cached role always belongs to the
 * authenticated user.
 * @param _username - GitHub login of the current user (unused).
 * @returns The cached role, or undefined.
 */
export const resolveRole = (_username: string): Role | undefined => cachedRole
