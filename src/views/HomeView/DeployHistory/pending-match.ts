import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'

/**
 * Check if pending deploy has been replaced by a real commit.
 * Matches by timestamp: if any fetched commit is newer or equal
 * to pending date, the pending card can be removed.
 * @param pending - Pending deploy or undefined
 * @param fetched - Fetched deploys from API
 * @returns true if pending is replaced or absent
 */
export const isPendingReplaced = (
  pending: CommitBuild | undefined,
  fetched: readonly CommitBuild[]
): boolean => {
  if (!pending) return true
  const pt = new Date(pending.date).getTime()
  return fetched.some(d => new Date(d.date).getTime() >= pt)
}
