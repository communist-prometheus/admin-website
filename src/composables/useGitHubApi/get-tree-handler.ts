import type { Ref } from 'vue'
import { UNKNOWN_ERROR_MESSAGE } from './constants'
import { fetchTree } from './fetch-tree'

/**
 * Creates handler for fetching tree from GitHub.
 * @param loading - Loading state ref
 * @param error - Error state ref
 * @returns Get tree handler function
 */
export const createGetTreeHandler =
  (loading: Ref<boolean>, error: Ref<string | null>) =>
  async (path = '') => {
    loading.value = true
    error.value = null
    try {
      return await fetchTree(path)
    } catch (err) {
      error.value = err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
      throw err
    } finally {
      loading.value = false
    }
  }
