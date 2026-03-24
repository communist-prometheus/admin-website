import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { GitHubTreeResponse } from '@/validation/schemas/github-api'
import { GitHubTreeResponseSchema } from '@/validation/schemas/github-api'

/**
 * Fetch tree from GitHub repository.
 * @param path - Directory path
 * @returns Tree response
 */
export const fetchTree = async (path = ''): Promise<GitHubTreeResponse> => {
  const res = await swFetch(
    `/api/github/tree?path=${encodeURIComponent(path)}`
  )
  return decodeResponse(GitHubTreeResponseSchema)(res)
}
