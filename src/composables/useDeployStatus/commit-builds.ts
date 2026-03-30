import type { CheckRun, CommitBuild } from './check-runs'
import { fetchCheckRun } from './check-runs'
import { ghFetch } from './gh-fetch'

const REPO = 'communist-prometheus/public-website'

interface RawCommit {
  readonly sha: string
  readonly commit: {
    readonly message: string
    readonly author: { readonly name: string; readonly date: string }
  }
}

/**
 * Fetch recent commits with build status.
 * @param count - Number of commits to fetch
 * @returns Commits with check run info
 */
export const fetchCommitBuilds = async (
  count = 10
): Promise<readonly CommitBuild[]> => {
  const data = await ghFetch<readonly RawCommit[]>(
    `/repos/${REPO}/commits?sha=master&per_page=${count}`
  )
  if (!Array.isArray(data)) return []
  const checks: readonly (CheckRun | undefined)[] = await Promise.all(
    data.map(c => fetchCheckRun(c.sha))
  )
  return data.map((c, i) => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0] ?? '',
    author: c.commit.author.name,
    date: c.commit.author.date,
    check: checks[i],
  }))
}
