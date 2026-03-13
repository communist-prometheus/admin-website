import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { AssetContent } from './asset-types'

/**
 * Fetch a single asset as base64 from the SW.
 * @param path - Asset file path
 * @returns Asset content with base64 data and MIME type
 */
export const fetchAsset = async (path: string): Promise<AssetContent> => {
  const res = await swFetch(
    `/api/github/asset?path=${encodeURIComponent(path)}`
  )
  return res.json() as Promise<AssetContent>
}
