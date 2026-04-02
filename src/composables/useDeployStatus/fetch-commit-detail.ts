import { ghFetch } from './gh-fetch'

const REPO = 'communist-prometheus/public-website'

/** A file changed in a commit. */
export interface CommitFile {
  readonly filename: string
  readonly status: string
  readonly additions: number
  readonly deletions: number
  readonly patch: string | undefined
}

/** Full commit detail with files. */
export interface CommitDetail {
  readonly sha: string
  readonly message: string
  readonly author: string
  readonly date: string
  readonly files: readonly CommitFile[]
}

/**
 * Fetch full commit detail including changed files.
 * @param sha - Full commit SHA
 * @returns Commit detail or undefined
 */
export const fetchCommitDetail = async (
  sha: string
): Promise<CommitDetail | undefined> => {
  const data = await ghFetch<{
    sha: string
    commit: {
      message: string
      author: { name: string; date: string }
    }
    files?: readonly CommitFile[]
  }>(`/repos/${REPO}/commits/${sha}`)
  if (!data) return undefined
  return {
    sha: data.sha,
    message: data.commit.message,
    author: data.commit.author.name,
    date: data.commit.author.date,
    files: data.files ?? [],
  }
}
