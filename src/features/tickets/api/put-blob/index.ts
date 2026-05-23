import { createBlob } from './blob'
import { createCommit } from './commit'
import { headRef, updateRef } from './ref'
import { createTree, treeOfCommit } from './tree'

interface PutDeps {
  readonly token: string
  readonly path: string
  readonly content: string
  readonly message: string
}

/**
 * Commit one file to the tickets repo via the Git Data API.
 * Required for files above the Contents-API ~1 MiB sweet spot;
 * caps at GitHub's 100 MiB blob ceiling.
 *
 * Flow: create blob → read branch ref → read parent tree →
 * create child tree → create commit → fast-forward ref.
 *
 * @param deps - Token + repo path + base64 content + commit message.
 */
export const putBlob = async (deps: PutDeps): Promise<void> => {
  const blobSha = await createBlob(deps.token, deps.content)
  const refSha = await headRef(deps.token)
  const baseTree = await treeOfCommit(deps.token, refSha)
  const treeSha = await createTree({
    token: deps.token,
    baseTree,
    path: deps.path,
    blobSha,
  })
  const commitSha = await createCommit({
    token: deps.token,
    message: deps.message,
    tree: treeSha,
    parent: refSha,
  })
  await updateRef(deps.token, commitSha)
}
