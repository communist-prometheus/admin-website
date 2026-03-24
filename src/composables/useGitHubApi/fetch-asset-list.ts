import { Schema } from 'effect'
import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { AssetItem } from '@/validation/schemas/asset'
import { AssetItemSchema } from '@/validation/schemas/asset'

/**
 * Fetch the list of assets under a given prefix.
 * @param prefix - Directory prefix
 * @returns Array of asset items
 */
export const fetchAssetList = async (
  prefix: string
): Promise<readonly AssetItem[]> => {
  const res = await swFetch(
    `/api/github/assets?prefix=${encodeURIComponent(prefix)}`
  )
  return decodeResponse(Schema.Array(AssetItemSchema))(res)
}
