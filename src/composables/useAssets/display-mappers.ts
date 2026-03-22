import type { AssetItem } from '../useGitHubApi/asset-types'
import { buildAssetPath } from './build-asset-path'
import type { AssetDisplay, PendingAsset } from './types'

/**
 * Check if an asset name matches the cover path.
 * @param name - Asset filename
 * @param cover - Cover path value
 * @returns Whether this asset is the cover
 */
export const isCoverMatch = (
  name: string,
  cover: string | undefined
): boolean => cover === `./assets/${name}`

/**
 * Map a committed asset to a display item.
 * @param item - Committed asset
 * @param deleted - Whether pending deletion
 * @param cover - Whether this is the cover
 * @param resolvedUrl - Resolved blob URL for preview
 * @returns Display item
 */
export const committedToDisplay = (
  item: AssetItem,
  deleted: boolean,
  cover: boolean,
  resolvedUrl: string
): AssetDisplay => ({
  name: item.name,
  path: item.path,
  mimeType: item.mimeType,
  thumbnailUrl: resolvedUrl,
  status: deleted ? 'pending-delete' : 'committed',
  isCover: cover,
})

/**
 * Map a pending asset to a display item.
 * @param asset - Pending asset
 * @param slug - Blog slug
 * @param cover - Whether this is the cover
 * @returns Display item
 */
export const pendingToDisplay = (
  asset: PendingAsset,
  type: string,
  slug: string,
  cover: boolean
): AssetDisplay => ({
  name: asset.name,
  path: buildAssetPath(type, slug, asset.name),
  mimeType: asset.mimeType,
  thumbnailUrl: asset.blobUrl,
  status: 'pending-add',
  isCover: cover,
})
