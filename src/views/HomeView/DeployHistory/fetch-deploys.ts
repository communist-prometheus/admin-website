import type { DeployEntry, GhCommit } from '@/api/deploys/types'
import { loadToken } from '@/composables/useAuth/token-storage'

const GH_API = 'https://api.github.com'
const REPO = 'communist-prometheus/public-website'

const fetchCommits = async (): Promise<readonly GhCommit[]> => {
  const token = loadToken()
  if (!token) return []
  const r = await fetch(
    `${GH_API}/repos/${REPO}/commits?sha=master&per_page=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!r.ok) return []
  const data: readonly {
    sha: string
    commit: {
      message: string
      author: { name: string; date: string }
    }
  }[] = await r.json()
  return data.map(c => ({
    sha: c.sha,
    message: c.commit.message.split('\n')[0] ?? '',
    author: c.commit.author.name,
    date: c.commit.author.date,
  }))
}

/**
 * Fetch deploy history: CF deploys + GitHub commits.
 * @returns Merged deploy entries
 */
export const fetchDeploys = async (): Promise<readonly DeployEntry[]> => {
  const [deploysRes, commits] = await Promise.all([
    fetch('/api/deploys'),
    fetchCommits(),
  ])
  if (!deploysRes.ok) return []
  const deploys: readonly DeployEntry[] = await deploysRes.json()
  return deploys.map(d => ({
    ...d,
    commit: findClosest(d.createdOn, commits),
  }))
}

const findClosest = (
  deployDate: string,
  commits: readonly GhCommit[]
): GhCommit | undefined => {
  const dt = new Date(deployDate).getTime()
  return commits.find(c => new Date(c.date).getTime() <= dt)
}
