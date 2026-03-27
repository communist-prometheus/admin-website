import { inject } from 'vue'
import { DEPLOY_TRACK_KEY } from '@/composables/useDeployStatus/deploy-context'
import { commitStaged } from './commit-staged'

/**
 * Commit staged changes and start deploy tracking.
 * @param message - Commit message
 * @returns Commit response with SHA
 */
export const useCommitAndTrack = () => {
  const track = inject(DEPLOY_TRACK_KEY, undefined)

  return async (message: string) => {
    const result = await commitStaged(message)
    if (result.success && result.sha && track) {
      track(result.sha)
    }
    return result
  }
}
