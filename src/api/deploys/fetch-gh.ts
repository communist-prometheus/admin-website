import type { GhCommit } from './types'

const REPO = 'communist-prometheus/admin-website'
const API = 'https://api.github.com'

interface GhCommitRaw {
  readonly sha: string
  readonly commit: {
    readonly message: string
    readonly author: {
      readonly name: string
      readonly date: string
    }
  }
}

/**
 * Fetch recent commits from admin-website master.
 * @param token - Optional GitHub token for auth
 * @returns Array of commit entries
 */
export const fetchGhCommits = async (
  token?: string
): Promise<readonly GhCommit[]> => {
  const url = `${API}/repos/${REPO}/commits?sha=master&per_page=20`
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'admin-website',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const r = await fetch(url, { headers })
  if (!r.ok) return []
  const data: readonly GhCommitRaw[] = await r.json()
  return data.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0] ?? '',
    author: c.commit.author.name,
    date: c.commit.author.date,
  }))
}
