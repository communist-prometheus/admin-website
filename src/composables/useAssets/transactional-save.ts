import { commitStaged } from '../useGitHubApi/commit-staged'
import { stageFile } from '../useGitHubApi/stage-file'
import { buildAssetPath } from './build-asset-path'
import { flushAdds } from './flush-adds'
import { flushDeletes } from './flush-deletes'
import type { PendingAsset } from './types'

/**
 * Parameters for a transactional save operation.
 */
export interface SaveParams {
  readonly type: string
  readonly slug: string
  readonly articlePath: string
  readonly articleContent: string
  readonly message: string
  readonly pendingAdds: readonly PendingAsset[]
  readonly pendingDeletes: ReadonlySet<string>
}

/*
 * Drop deletes that target a path also present in pendingAdds.
 *
 * Replacing an asset with the SAME filename produces a collision:
 * `addAsset` schedules the existing committed path for deletion via
 * `scheduleReplace` (so the old bytes are removed) AND queues the
 * new bytes in pendingAdds. With same name + same slug + same type
 * → same target path. Without this filter, transactionalSave first
 * stages the new bytes via flushAdds, then runs `git rm` on the
 * same path via flushDeletes — net effect: file gone. The user
 * uploads a new PDF, the save commits, and the asset disappears.
 *
 * Deletes are still applied to truly orphan paths (e.g. the editor
 * deleted an asset and didn't replace it).
 */
const dropOverlap = (
  type: string,
  slug: string,
  adds: readonly PendingAsset[],
  deletes: ReadonlySet<string>
): ReadonlySet<string> => {
  const addedPaths = new Set(
    adds.map(a => buildAssetPath(type, slug, a.name))
  )
  return new Set([...deletes].filter(p => !addedPaths.has(p)))
}

/**
 * Perform a transactional save: stage all changes, then commit.
 * @param params - Save parameters
 * @returns Commit SHA
 */
export const transactionalSave = async (
  params: SaveParams
): Promise<string> => {
  const safeDeletes = dropOverlap(
    params.type,
    params.slug,
    params.pendingAdds,
    params.pendingDeletes
  )
  await flushAdds(params.type, params.slug, params.pendingAdds)
  await flushDeletes(safeDeletes)
  await stageFile(params.articlePath, params.articleContent)
  const result = await commitStaged(params.message)
  return result.sha
}
