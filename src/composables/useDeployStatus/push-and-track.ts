import { inject } from 'vue'
import { commitStaged } from '../useGitHubApi/commit-staged'
import { DEPLOY_TRACK_KEY } from './deploy-context'
import { clearPendingDeploy, setPendingDeploy } from './pending-deploy'

/**
 * Unified push flow: pending → commit+push → track deploy.
 * On error: clears pending, shows alert, re-throws.
 * Use for any operation that stages changes and needs to push.
 * @returns Async function that commits staged changes with tracking
 */
export const usePushAndTrack = () => {
  const track = inject(DEPLOY_TRACK_KEY, undefined)

  return async (message: string): Promise<string> => {
    setPendingDeploy(message)
    try {
      const result = await commitStaged(message)
      if (track) track()
      return result.sha
    } catch (err) {
      clearPendingDeploy()
      const msg = err instanceof Error ? err.message : 'Push failed'
      globalThis.alert(`Deploy failed: ${msg}`)
      throw err
    }
  }
}
