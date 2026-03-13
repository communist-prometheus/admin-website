import { deleteAsset } from '../useGitHubApi/delete-asset'

/**
 * Delete all pending asset removals from the SW virtual FS.
 * @param deletes - Set of asset paths to delete
 */
export const flushDeletes = async (
  deletes: ReadonlySet<string>
): Promise<void> => {
  for (const path of deletes) {
    await deleteAsset(path)
  }
}
