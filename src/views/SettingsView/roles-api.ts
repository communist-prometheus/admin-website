import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { RolesConfig } from '@/types/role'

/** Identity + org role for a GitHub organisation member. */
export interface OrgMember {
  readonly login: string
  readonly orgRole: 'admin' | 'member'
}

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
 * Fetch every GitHub-org member (admin + regular) via the SW. The
 * SW handler calls `GET /orgs/{owner}/members?role={admin,member}`
 * and returns the tagged union. Falls back to an empty list so the
 * UI never crashes when the OAuth token lacks `read:org`.
 *
 * @returns list of org members with their org role
 */
export const fetchOrgMembers = async (): Promise<readonly OrgMember[]> => {
  const res = await swFetch('/api/github/org-members')
  if (!res.ok) return []
  const body = (await res.json()) as {
    readonly members?: readonly OrgMember[]
  }
  return body.members ?? []
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
