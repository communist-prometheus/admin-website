import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { OrgMembersPayload } from './roles-api-types'

const empty: OrgMembersPayload = { members: [], invitations: [] }

/**
 * Fetch every org member (with app role mapped from GitHub team
 * membership) and every pending invitation in one payload.
 *
 * @returns members + invitations; falls back to empty on failure
 */
export const fetchOrgMembers = async (): Promise<OrgMembersPayload> => {
  const res = await swFetch('/api/github/org-members')
  return res.ok ? ((await res.json()) as OrgMembersPayload) : empty
}
