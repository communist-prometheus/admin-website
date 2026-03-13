import { writeAsset } from '../useGitHubApi/write-asset'
import { buildAssetPath } from './build-asset-path'
import type { PendingAsset } from './types'

/**
 * Write all pending asset additions to the SW virtual FS.
 * @param slug - Blog article slug
 * @param adds - Pending assets to write
 */
export const flushAdds = async (
  slug: string,
  adds: readonly PendingAsset[]
): Promise<void> => {
  for (const asset of adds) {
    const path = buildAssetPath(slug, asset.name)
    await writeAsset(path, asset.base64)
  }
}
