import { computed, ref } from 'vue'
import { usePermissions } from '@/composables/usePermissions'
import type { OrgMember } from './roles-api-types'
import { useOrgMembers } from './useOrgMembers'

const rank = { admin: 0, 'chief-editor': 1, editor: 2 } as const

const sortByRank = (xs: readonly OrgMember[]) =>
  [...xs].sort((a, b) => {
    const ra = a.appRole ? rank[a.appRole] : 3
    const rb = b.appRole ? rank[b.appRole] : 3
    return ra !== rb ? ra - rb : a.login.localeCompare(b.login)
  })

/**
 * Build the reactive state for MembersSection: cached org
 * members + invitations, the sort, the dialog flag, the busy
 * flag, and the disabled computed.
 *
 * @returns reactive state bundle
 */
export const buildMembersState = () => {
  const { members, invitations, loading, load } = useOrgMembers()
  const { canEditSettings } = usePermissions()
  const dialogOpen = ref(false)
  const busy = ref(false)
  const sorted = computed(() => sortByRank(members.value))
  const disabled = computed(() => busy.value || !canEditSettings.value)
  return {
    members,
    invitations,
    loading,
    load,
    canEditSettings,
    dialogOpen,
    busy,
    sorted,
    disabled,
  }
}
