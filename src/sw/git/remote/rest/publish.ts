import { log } from '../../../logging/logger'
import type { SWGitConfig } from '../../../protocol'
import { workerState } from '../../../state/state'
import { createCommit, updateRef } from './push-commit'

interface CommitAuthor {
  readonly name: string
  readonly email: string
  readonly timestamp: number
}

/** Local commit metadata plus where it lands on the remote. */
export interface PublishSpec {
  readonly message: string
  readonly author: CommitAuthor
  readonly parent: string
  readonly tree: string
}

const authorOf = (
  config: SWGitConfig,
  author: CommitAuthor
): { name: string; email: string; date: string } => ({
  name: config.authorName ?? author.name,
  email: config.authorEmail ?? author.email,
  date: new Date(author.timestamp * 1000).toISOString(),
})

/**
 * Commit `spec.tree` onto the remote tip and fast-forward the branch ref,
 * mirroring the local commit's message + author, then record the new sha.
 * @param config - SW git configuration
 * @param spec - Local commit metadata, remote parent, and new tree sha
 */
export const publishTree = async (
  config: SWGitConfig,
  spec: PublishSpec
): Promise<void> => {
  const commitSha = await createCommit(config, {
    message: spec.message,
    tree: spec.tree,
    parent: spec.parent,
    author: authorOf(config, spec.author),
  })
  await updateRef(config, commitSha)
  workerState.commitSha = commitSha
  log(
    'info',
    'git',
    `rest push: ${config.branch} -> ${commitSha.slice(0, 7)}`
  )
}
