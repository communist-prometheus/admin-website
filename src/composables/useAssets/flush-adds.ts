import { writeAsset } from '../useGitHubApi/write-asset'
import { buildAssetPath } from './build-asset-path'
import type { PendingAsset } from './types'

/**
 * Write all pending asset additions to the SW virtual FS.
 * @param type - Content type
 * @param slug - Content slug
 * @param adds - Pending assets to write
 */
export const flushAdds = async (
  type: string,
  slug: string,
  adds: readonly PendingAsset[]
): Promise<void> => {
  for (const asset of adds) {
    const path = buildAssetPath(type, slug, asset.name)
    await writeAsset(path, asset.base64)
  }
}
