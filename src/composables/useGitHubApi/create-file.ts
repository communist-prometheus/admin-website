import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { CommitResponse } from '@/validation/schemas/sw-api'
import { CommitResultSchema } from '@/validation/schemas/sw-api'
import type { CreateFileParams } from './types'

/**
 * Create file in GitHub repository.
 * @param params - File creation parameters
 * @returns Commit result with SHA
 */
export const createFile = async (
  params: CreateFileParams
): Promise<CommitResponse> => {
  const res = await swFetch('/api/github/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return decodeResponse(CommitResultSchema)(res)
}
