import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SuccessResponse } from '@/validation/schemas/api-response'
import { SuccessResponseSchema } from '@/validation/schemas/api-response'

/**
 * Write + stage a file without committing.
 * @param path - File path
 * @param content - File content string
 * @returns Success response
 */
export const stageFile = async (
  path: string,
  content: string
): Promise<SuccessResponse> => {
  const res = await swFetch('/api/github/file/stage', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ path, content }),
  })
  return decodeResponse(SuccessResponseSchema)(res)
}
