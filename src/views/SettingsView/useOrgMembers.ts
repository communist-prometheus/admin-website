import { ref } from 'vue'
import { fetchOrgMembers, type OrgMember } from './roles-api'

/**
 * Composable that fetches every member of the GitHub organisation
 * (both admins and regular members) from the SW.
 *
 * @returns reactive member list + loader + loading flag
 */
export const useOrgMembers = () => {
  const members = ref<readonly OrgMember[]>([])
  const loading = ref(false)

  const load = async (): Promise<void> => {
    loading.value = true
    try {
      members.value = await fetchOrgMembers()
    } finally {
      loading.value = false
    }
  }

  return { members, loading, load }
}
