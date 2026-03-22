import { commitStaged } from '../useGitHubApi/commit-staged'
import { stageFile } from '../useGitHubApi/stage-file'
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

/**
 * Perform a transactional save: stage all changes, then commit.
 * @param params - Save parameters
 * @returns Commit SHA
 */
export const transactionalSave = async (
  params: SaveParams
): Promise<string> => {
  await flushAdds(params.type, params.slug, params.pendingAdds)
  await flushDeletes(params.pendingDeletes)
  await stageFile(params.articlePath, params.articleContent)
  const result = await commitStaged(params.message)
  return result.sha
}
