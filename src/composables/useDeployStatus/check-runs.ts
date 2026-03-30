import { ghFetch } from './gh-fetch'

const REPO = 'communist-prometheus/public-website'

/** GitHub check run status for a commit. */
export interface CheckRun {
  readonly name: string
  readonly status: 'queued' | 'in_progress' | 'completed'
  readonly conclusion: string | undefined
  readonly started_at: string | undefined
  readonly completed_at: string | undefined
}

/** Commit with its build check run. */
export interface CommitBuild {
  readonly sha: string
  readonly message: string
  readonly author: string
  readonly date: string
  readonly check: CheckRun | undefined
}

/**
 * Fetch check run for a specific commit.
 * @param sha - Commit SHA
 * @returns First check run or undefined
 */
export const fetchCheckRun = async (
  sha: string
): Promise<CheckRun | undefined> => {
  const data = await ghFetch<{ check_runs?: readonly CheckRun[] }>(
    `/repos/${REPO}/commits/${sha}/check-runs`
  )
  return data?.check_runs?.[0]
}
