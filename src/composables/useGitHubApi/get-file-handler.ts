import { Effect } from 'effect'
import type { Ref } from 'vue'
import { UNKNOWN_ERROR_MESSAGE } from './constants'
import { fetchFile } from './fetch-file'

/**
 * Creates handler for fetching file from GitHub
 * @param loading - Loading state ref
 * @param error - Error state ref
 * @returns Get file handler function
 */
export const createGetFileHandler =
  (loading: Ref<boolean>, error: Ref<string | null>) =>
  async (path: string) => {
    loading.value = true
    error.value = null
    return Effect.runPromise(fetchFile(path))
      .catch(err => {
        error.value =
          err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }
