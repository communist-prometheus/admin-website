import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { CommitResponse } from '@/validation/schemas/sw-api'
import { CommitResultSchema } from '@/validation/schemas/sw-api'
import type { UpdateFileParams } from './types'

/**
 * Update file in GitHub repository.
 * @param params - File update parameters
 * @returns Commit result with SHA
 */
export const updateFile = async (
  params: UpdateFileParams
): Promise<CommitResponse> => {
  const res = await swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return decodeResponse(CommitResultSchema)(res)
}
