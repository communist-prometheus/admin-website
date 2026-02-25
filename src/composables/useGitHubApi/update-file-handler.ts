import { Effect } from 'effect'
import type { Ref } from 'vue'
import { UNKNOWN_ERROR_MESSAGE } from './constants'
import { updateFile } from './update-file'

export const createUpdateFileHandler =
  (loading: Ref<boolean>, error: Ref<string | null>) =>
  async (path: string, content: string, message: string, sha: string) => {
    loading.value = true
    error.value = null
    return Effect.runPromise(updateFile({ path, content, message, sha }))
      .catch(err => {
        error.value =
          err instanceof Error ? err.message : UNKNOWN_ERROR_MESSAGE
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }
