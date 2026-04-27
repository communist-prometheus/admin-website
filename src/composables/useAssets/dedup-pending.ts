import type { PendingAsset } from './types'

const revoke = (asset: PendingAsset): readonly PendingAsset[] => {
  URL.revokeObjectURL(asset.blobUrl)
  return []
}

/**
 * Drop any pending entries whose name matches `name`, revoking the
 * blob URLs they held so we don't leak object URLs in memory.
 *
 * @param pending - Current pending-adds list
 * @param name - File name being added
 * @returns New list without same-name entries
 */
export const dedupPending = (
  pending: readonly PendingAsset[],
  name: string
): readonly PendingAsset[] =>
  pending.flatMap(a => (a.name === name ? revoke(a) : [a]))

const addToSet = <T>(s: ReadonlySet<T>, v: T): ReadonlySet<T> => {
  const next = new Set(s)
  next.add(v)
  return next
}

/**
 * If a committed asset with the same name exists, schedule its path
 * for deletion in the next transactional save. Idempotent — re-adding
 * the same name doesn't grow the delete set.
 *
 * @param deletes - Current pending-deletes set
 * @param committedPath - Path of the committed file with the matching name, if any
 * @returns New delete set (same instance if nothing changed)
 */
export const scheduleReplace = (
  deletes: ReadonlySet<string>,
  committedPath: string | undefined
): ReadonlySet<string> =>
  committedPath === undefined || deletes.has(committedPath)
    ? deletes
    : addToSet(deletes, committedPath)
