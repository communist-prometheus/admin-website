import { Effect } from 'effect'
import type { Ref } from 'vue'
import { UNKNOWN_ERROR_MESSAGE } from './constants'
import { fetchTree } from './fetch-tree'

export const createGetTreeHandler =
  (loading: Ref<boolean>, error: Ref<string | null>) =>
  async (path = '') => {
    loading.value = true
    error.value = null
    return Effect.runPromise(fetchTree(path))
      .catch(err => {
        error.value =
          err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }
