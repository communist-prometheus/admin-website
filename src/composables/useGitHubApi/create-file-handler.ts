import { Effect } from 'effect'
import type { Ref } from 'vue'
import { UNKNOWN_ERROR_MESSAGE } from './constants'
import { createFile } from './create-file'

/**
 * Creates handler for creating files in GitHub
 * @param loading - Loading state ref
 * @param error - Error state ref
 * @returns Create file handler function
 */
export const createCreateFileHandler =
  (loading: Ref<boolean>, error: Ref<string | null>) =>
  async (path: string, content: string, message: string) => {
    loading.value = true
    error.value = null
    return Effect.runPromise(createFile({ path, content, message }))
      .catch(err => {
        error.value =
          err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }
