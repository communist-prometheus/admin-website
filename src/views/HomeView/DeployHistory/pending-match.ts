import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'

/** Max time pending card stays visible (5 minutes). */
const MAX_PENDING_MS = 5 * 60 * 1000

/**
 * Check if pending deploy should be replaced.
 * Replaced when: a new commit appears in fetched since pending
 * was created, OR pending is older than 5 minutes.
 * @param pending - Pending deploy or undefined
 * @param fetched - Fetched deploys from API
 * @param initialCount - Fetched count when pending was created
 * @returns true if pending should be removed
 */
export const isPendingReplaced = (
  pending: CommitBuild | undefined,
  fetched: readonly CommitBuild[],
  initialCount: number
): boolean => {
  if (!pending) return true
  if (fetched.length > initialCount) return true
  const age = Date.now() - new Date(pending.date).getTime()
  return age > MAX_PENDING_MS
}
