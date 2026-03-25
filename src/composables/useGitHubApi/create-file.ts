import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SuccessResponse } from '@/validation/schemas/api-response'
import { SuccessResponseSchema } from '@/validation/schemas/api-response'
import type { CreateFileParams } from './types'

/**
 * Create file in GitHub repository.
 * @param params - File creation parameters
 * @returns File creation result
 */
export const createFile = async (
  params: CreateFileParams
): Promise<SuccessResponse> => {
  const res = await swFetch('/api/github/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return decodeResponse(SuccessResponseSchema)(res)
}
