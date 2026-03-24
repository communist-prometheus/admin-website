import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { GitHubFileContent } from '@/validation/schemas/github-api'
import { GitHubFileContentSchema } from '@/validation/schemas/github-api'

/**
 * Fetch file content from GitHub.
 * @param path - File path
 * @returns File content
 */
export const fetchFile = async (path: string): Promise<GitHubFileContent> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(path)}`
  )
  return decodeResponse(GitHubFileContentSchema)(res)
}
