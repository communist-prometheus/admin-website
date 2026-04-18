import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { StagedResponse } from '@/validation/schemas/sw-api'
import { StagedResultSchema } from '@/validation/schemas/sw-api'
import type { CreateFileParams } from './types'

/**
 * Stage a new file in the local git repo (no commit/push).
 * Caller is responsible for committing via commitStaged().
 * @param params - File creation parameters
 * @returns Staged result with content SHA
 */
export const createFile = async (
  params: CreateFileParams
): Promise<StagedResponse> => {
  const res = await swFetch('/api/github/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return decodeResponse(StagedResultSchema)(res)
}
