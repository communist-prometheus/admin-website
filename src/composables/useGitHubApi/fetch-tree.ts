import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { SWTreeResponse } from '@/validation/schemas/sw-api'
import { SWTreeResponseSchema } from '@/validation/schemas/sw-api'

/**
 * Fetch tree from SW service worker.
 * @param path - Directory path
 * @returns Tree response with items
 */
export const fetchTree = async (path = ''): Promise<SWTreeResponse> => {
  const res = await swFetch(
    `/api/github/tree?path=${encodeURIComponent(path)}`
  )
  return decodeResponse(SWTreeResponseSchema)(res)
}
