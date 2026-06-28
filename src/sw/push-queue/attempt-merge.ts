import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { buildAuthOpts } from '../git/remote/build-auth-opts'
import type { SWGitConfig } from '../protocol'
import { collectConflictFiles } from './collect-conflict-files'
import {
  isMergeConflict,
  isUnrelatedHistories,
  type MergeOutcome,
} from './merge-classify'
import { mergeUnrelated } from './merge-unrelated'

export type { MergeOutcome } from './merge-classify'

const conflictOutcome = async (error: unknown): Promise<MergeOutcome> => ({
  kind: 'conflict',
  files: await collectConflictFiles(error),
})

/*
 * A force-pushed remote leaves no common ancestor; pull bails with
 * MergeNotSupportedError. Recover via an explicit unrelated merge.
 * Everything else is a genuine failure surfaced to the caller.
 */
const classifyMergeError = (
  config: SWGitConfig,
  error: unknown
): Promise<MergeOutcome> | MergeOutcome =>
  isMergeConflict(error)
    ? conflictOutcome(error)
    : isUnrelatedHistories(error)
      ? mergeUnrelated(config)
      : { kind: 'fail', error }

/**
 * Attempt to fast-forward / auto-merge the local branch against
 * the remote. Wraps `git.pull` so callers can react to the three
 * outcomes without parsing error names themselves.
 * @param config Validated SW git configuration.
 * @returns Discriminated outcome (clean / conflict / fail).
 */
export const attemptMerge = async (
  config: SWGitConfig
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
    return classifyMergeError(config, error)
  }
}
