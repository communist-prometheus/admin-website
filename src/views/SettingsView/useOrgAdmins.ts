import { ref } from 'vue'
import { fetchOrgAdmins } from './roles-api'

/**
 * Composable that fetches the list of GitHub-org admin logins via
 * the SW.
 *
 * @returns reactive admin list + loader
 */
export const useOrgAdmins = () => {
  const admins = ref<readonly string[]>([])
  const loading = ref(false)

  const load = async (): Promise<void> => {
    loading.value = true
    try {
      admins.value = await fetchOrgAdmins()
    } finally {
      loading.value = false
    }
  }

  return { admins, loading, load }
}
