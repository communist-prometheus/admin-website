import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SuccessResponse } from '@/validation/schemas/api-response'
import { SuccessResponseSchema } from '@/validation/schemas/api-response'

/**
 * Delete an asset file from the SW virtual FS.
 * @param path - Asset file path to delete
 * @returns Success response
 */
export const deleteAsset = async (path: string): Promise<SuccessResponse> => {
  const res = await swFetch('/api/github/asset', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  return decodeResponse(SuccessResponseSchema)(res)
}
