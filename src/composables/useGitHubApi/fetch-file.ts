import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SWFile } from '@/validation/schemas/sw-api'
import { SWFileSchema } from '@/validation/schemas/sw-api'

/**
 * Fetch file content from SW.
 * @param path - File path
 * @returns File content with path and sha
 */
export const fetchFile = async (path: string): Promise<SWFile> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(path)}`
  )
  return decodeResponse(SWFileSchema)(res)
}
