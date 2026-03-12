import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { GitHubTreeResponse } from './types'

/**
 * Fetch tree from GitHub repository.
 * @param path - Directory path
 * @returns Tree response
 */
export const fetchTree = async (path = ''): Promise<GitHubTreeResponse> => {
  const res = await swFetch(
    `/api/github/tree?path=${encodeURIComponent(path)}`
  )
  return res.json() as Promise<GitHubTreeResponse>
}
