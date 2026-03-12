import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { GitHubFileContent } from './types'

/**
 * Fetch file content from GitHub.
 * @param path - File path
 * @returns File content
 */
export const fetchFile = async (path: string): Promise<GitHubFileContent> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(path)}`
  )
  return res.json() as Promise<GitHubFileContent>
}
