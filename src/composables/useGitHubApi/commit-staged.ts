import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { CommitResponse } from '@/validation/schemas/api-response'
import { CommitResponseSchema } from '@/validation/schemas/api-response'

/**
 * Commit all staged changes and push to remote.
 * @param message - Commit message
 * @returns Commit SHA
 */
export const commitStaged = async (
  message: string
): Promise<CommitResponse> => {
  const res = await swFetch('/api/github/commit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return decodeResponse(CommitResponseSchema)(res)
}
