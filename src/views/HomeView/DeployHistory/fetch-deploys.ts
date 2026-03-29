import type { CfDeploy } from '@/api/deploys/types'

/**
 * Fetch deployment history from CF API.
 * @returns Array of CF deploy entries
 */
export const fetchDeploys = async (): Promise<readonly CfDeploy[]> => {
  const r = await fetch('/api/deploys')
  if (!r.ok) return []
  return r.json()
}
