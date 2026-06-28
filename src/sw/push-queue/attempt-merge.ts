import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { buildAuthOpts } from '../git/remote/build-auth-opts'
import type { SWGitConfig } from '../protocol'
import type { MergeOutcome } from './merge-classify'
import { classifyMergeError } from './merge-recover'
import type { PushQueueEntry } from './types'

export type { MergeOutcome } from './merge-classify'

/**
 * Reconcile the local branch with the remote after a non-fast-forward
 * rejection. A clean `git.pull` fast-forwards / 3-way merges; a genuine
 * conflict surfaces for the visual-merge UI; anything else (unrelated /
 * shallow-diverged) is recovered by reset-onto-remote + replay.
 * @param config Validated SW git configuration.
 * @param entry Queued user commit (needed to replay on recovery).
 * @returns Discriminated outcome (clean / rebased / conflict / fail).
 */
export const attemptMerge = async (
  config: SWGitConfig,
  entry: PushQueueEntry
): Promise<MergeOutcome> => {
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  const opts = buildAuthOpts(config, http)
  try {
    await git.pull({
      ...opts,
      fs,
      dir: REPO_DIR,
      ref: config.branch,
      singleBranch: true,
      author: {
        name: config.authorName ?? 'Admin',
        email: config.authorEmail ?? 'admin@prometheus.org',
      },
    })
    return { kind: 'clean' }
  } catch (error) {
    return classifyMergeError(config, entry, error)
  }
}
