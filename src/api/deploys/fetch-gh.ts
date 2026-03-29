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
 * Public repo — no auth required, User-Agent mandatory.
 * @returns Array of commit entries
 */
export const fetchGhCommits = async (): Promise<readonly GhCommit[]> => {
  const url = `${API}/repos/${REPO}/commits?sha=master&per_page=20`
  const r = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'admin-website',
    },
  })
  if (!r.ok) return []
  const data: readonly GhCommitRaw[] = await r.json()
  return data.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0] ?? '',
    author: c.commit.author.name,
    date: c.commit.author.date,
  }))
}
