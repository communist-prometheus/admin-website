import { ref } from 'vue'
import { overlayRoles } from './member-roles'
import {
  fetchOrgMembers,
  fetchRoleMap,
  type OrgInvitation,
  type OrgMember,
} from './roles-api'

/**
 * Composable that fetches every GitHub organisation member and
 * every pending invitation in a single call. The list is sourced
 * from the SW, which aggregates org members, team memberships
 * (mapping to app roles), and pending invitations.
 *
 * @returns reactive members + invitations + loader + loading flag
 */
export const useOrgMembers = () => {
  const members = ref<readonly OrgMember[]>([])
  const invitations = ref<readonly OrgInvitation[]>([])
  const loading = ref(false)

  const load = async (): Promise<void> => {
    loading.value = true
    try {
      const [payload, roleMap] = await Promise.all([
        fetchOrgMembers(),
        fetchRoleMap(),
      ])
      members.value = overlayRoles(payload.members, roleMap)
      invitations.value = payload.invitations
    } finally {
      loading.value = false
    }
  }

  return { members, invitations, loading, load }
}
