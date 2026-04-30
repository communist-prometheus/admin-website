import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { buildAuthOpts } from '../git/remote/build-auth-opts'
import type { SWGitConfig } from '../protocol'
import { filesFromError, filesFromStatus } from './merge-conflict-files'

/** Outcome of a single auto-merge attempt. */
export type MergeOutcome =
  | { readonly kind: 'clean' }
  | {
      readonly kind: 'conflict'
      readonly files: ReadonlyArray<string>
    }
  | { readonly kind: 'fail'; readonly error: unknown }

const isMergeConflict = (error: unknown): boolean =>
  error instanceof Error && error.name === 'MergeConflictError'

const collectConflictFiles = async (
  error: unknown
): Promise<ReadonlyArray<string>> => {
  const fromError = filesFromError(error)
  return fromError.length > 0 ? fromError : await filesFromStatus()
}

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
    return isMergeConflict(error)
      ? { kind: 'conflict', files: await collectConflictFiles(error) }
      : { kind: 'fail', error }
  }
}
