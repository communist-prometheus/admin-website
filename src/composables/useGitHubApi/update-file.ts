import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SuccessResponse } from '@/validation/schemas/api-response'
import { SuccessResponseSchema } from '@/validation/schemas/api-response'
import type { UpdateFileParams } from './types'

/**
 * Update file in GitHub repository.
 * @param params - File update parameters
 * @returns Update result
 */
export const updateFile = async (
  params: UpdateFileParams
): Promise<SuccessResponse> => {
  const res = await swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return decodeResponse(SuccessResponseSchema)(res)
}
