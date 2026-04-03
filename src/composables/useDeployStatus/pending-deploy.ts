import { ref } from 'vue'
import type { CommitBuild } from './check-runs'

/** Shared reactive ref for pending deploy after save. */
export const pendingDeploy = ref<CommitBuild | undefined>()

/**
 * Set a pending deploy entry (shown instantly on home).
 * Matched by timestamp when real commit appears.
 * @param message - Commit message from save
 */
export const setPendingDeploy = (message: string) => {
  pendingDeploy.value = {
    sha: '',
    message,
    author: 'you',
    date: new Date().toISOString(),
    check: undefined,
  }
}
