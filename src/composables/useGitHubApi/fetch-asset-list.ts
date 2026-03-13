import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import type { AssetItem } from './asset-types'

/**
 * Fetch the list of assets under a given prefix.
 * @param prefix - Directory prefix (e.g. src/content/blog/slug/assets)
 * @returns Array of asset items
 */
export const fetchAssetList = async (
  prefix: string
): Promise<readonly AssetItem[]> => {
  const res = await swFetch(
    `/api/github/assets?prefix=${encodeURIComponent(prefix)}`
  )
  return res.json() as Promise<readonly AssetItem[]>
}
