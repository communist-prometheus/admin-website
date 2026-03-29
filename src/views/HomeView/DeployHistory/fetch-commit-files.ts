import { loadToken } from '@/composables/useAuth/token-storage'

const GH_API = 'https://api.github.com'
const REPO = 'communist-prometheus/public-website'

/** A file changed in a commit. */
export interface CommitFile {
  readonly filename: string
  readonly status: string
  readonly additions: number
  readonly deletions: number
}

/**
 * Fetch changed files for a commit SHA.
 * @param sha - Full commit SHA
 * @returns Changed files or empty array
 */
export const fetchCommitFiles = async (
  sha: string
): Promise<readonly CommitFile[]> => {
  const token = loadToken()
  if (!token) return []
  const r = await fetch(`${GH_API}/repos/${REPO}/commits/${sha}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) return []
  const data: { files?: readonly CommitFile[] } = await r.json()
  return data.files ?? []
}
