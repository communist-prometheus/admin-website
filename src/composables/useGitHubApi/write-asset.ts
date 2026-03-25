import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SuccessResponse } from '@/validation/schemas/api-response'
import { SuccessResponseSchema } from '@/validation/schemas/api-response'

/**
 * Write a binary asset to the SW virtual FS (base64).
 * @param path - Target file path
 * @param content - Base64-encoded content
 * @returns Success response
 */
export const writeAsset = async (
  path: string,
  content: string
): Promise<SuccessResponse> => {
  const res = await swFetch('/api/github/asset', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, content }),
  })
  return decodeResponse(SuccessResponseSchema)(res)
}
