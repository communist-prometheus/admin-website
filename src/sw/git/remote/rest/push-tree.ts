import type { SWGitConfig } from '../../../protocol'
import type { FileChange } from '../../../push-queue/collect-change'
import { ghSend, toBase64 } from './gh-send'
import { shaOf } from './narrow'
import { repoPath } from './repo-path'

const BLOB_MODE = '100644'

interface TreeEntry {
  readonly path: string
  readonly mode: string
  readonly type: 'blob'
  readonly sha: string | null
}

const blobSha = async (
  config: SWGitConfig,
  data: Uint8Array
): Promise<string> =>
  shaOf(
    await ghSend('POST', `${repoPath(config)}/git/blobs`, config.token, {
      content: toBase64(data),
      encoding: 'base64',
    })
  )

const treeEntry = async (
  config: SWGitConfig,
  change: FileChange
): Promise<TreeEntry> =>
  'deleted' in change
    ? { path: change.path, mode: BLOB_MODE, type: 'blob', sha: null }
    : {
        path: change.path,
        mode: BLOB_MODE,
        type: 'blob',
        sha: await blobSha(config, change.data),
      }

/**
 * Create a tree from `changes` layered on `baseTree` (a deletion carries a
 * null sha per the GitHub Git Data contract).
 * @param config - SW git configuration
 * @param baseTree - Base tree sha to layer onto
 * @param changes - Files added/modified/deleted
 * @returns The new tree sha
 */
export const buildTree = async (
  config: SWGitConfig,
  baseTree: string,
  changes: ReadonlyArray<FileChange>
): Promise<string> => {
  const tree = await Promise.all(changes.map(c => treeEntry(config, c)))
  return shaOf(
    await ghSend('POST', `${repoPath(config)}/git/trees`, config.token, {
      base_tree: baseTree,
      tree,
    })
  )
}
