import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { RolesConfig } from '@/types/role'

/**
 * Fetch the full roles config from the SW.
 * @returns Roles config or default empty config
 */
export const fetchRolesConfig = async (): Promise<RolesConfig> => {
  const res = await swFetch('/api/github/roles')
  if (!res.ok) return { roles: { editor: [], 'chief-editor': [], admin: [] } }
  return (await res.json()) as RolesConfig
}

/**
 * Fetch the list of GitHub-org admin logins from the SW. The SW in
 * turn calls `GET /orgs/{owner}/members?role=admin`. Falls back to an
 * empty list on failure so callers can degrade gracefully.
 *
 * @returns list of lowercase-safe GitHub usernames with org-admin role
 */
export const fetchOrgAdmins = async (): Promise<readonly string[]> => {
  const res = await swFetch('/api/github/org-members')
  if (!res.ok) return []
  const body = (await res.json()) as { readonly admins?: readonly string[] }
  return body.admins ?? []
}

/**
 * Save updated roles config to the SW.
 * @param config - Updated roles config
 */
export const saveRolesConfig = async (config: RolesConfig): Promise<void> => {
  await swFetch('/api/github/roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
}
