import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import { fetchCommitBuilds } from '@/composables/useDeployStatus/commit-builds'

export type { CommitBuild }

/**
 * Fetch deployment history via GitHub Check Runs.
 * @returns Commits with CF build status
 */
export const fetchDeploys = () => fetchCommitBuilds(15)
