import type { DeployEntry } from '@/api/deploys/types'

/**
 * Fetch deployment history from the API.
 * @returns Array of deploy entries
 */
export const fetchDeploys = async (): Promise<readonly DeployEntry[]> => {
  const r = await fetch('/api/deploys')
  if (!r.ok) return []
  return r.json()
}
