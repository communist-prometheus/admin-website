import type { SWGitConfig } from '../../../protocol'
import { ghSend } from './gh-send'
import { shaOf } from './narrow'
import { repoPath } from './repo-path'

interface CommitSpec {
  readonly message: string
  readonly tree: string
  readonly parent: string
  readonly author: { name: string; email: string; date: string }
}

/**
 * Create a commit object pointing at `spec.tree` with `spec.parent`.
 * @param config - SW git configuration
 * @param spec - Message, tree sha, parent sha, and author
 * @returns The new commit sha
 */
export const createCommit = async (
  config: SWGitConfig,
  spec: CommitSpec
): Promise<string> =>
  shaOf(
    await ghSend('POST', `${repoPath(config)}/git/commits`, config.token, {
      message: spec.message,
      tree: spec.tree,
      parents: [spec.parent],
      author: spec.author,
    })
  )

/**
 * Fast-forward the branch ref to `sha` (never force) so a diverged remote
 * is rejected with 422 → non-fast-forward recovery.
 * @param config - SW git configuration
 * @param sha - New commit sha for the branch head
 */
export const updateRef = async (
  config: SWGitConfig,
  sha: string
): Promise<void> => {
  await ghSend(
    'PATCH',
    `${repoPath(config)}/git/refs/heads/${config.branch}`,
    config.token,
    { sha, force: false }
  )
}
