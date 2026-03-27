import { inject } from 'vue'
import { DEPLOY_TRACK_KEY } from '@/composables/useDeployStatus/deploy-context'
import { commitStaged } from './commit-staged'

/**
 * Commit staged changes and start deploy tracking.
 * @returns Async commit function
 */
export const useCommitAndTrack = () => {
  const track = inject(DEPLOY_TRACK_KEY, undefined)

  return async (message: string) => {
    const result = await commitStaged(message)
    if (result.success && track) track()
    return result
  }
}
