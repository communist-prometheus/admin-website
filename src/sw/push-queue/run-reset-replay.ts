import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import { buildAuthOpts } from '../git/remote/build-auth-opts'
import { log } from '../logging/logger'
import type { workerState } from '../state/state'
import { applyChanges } from './apply-changes'
import { changedFilesOfCommit } from './changed-files-of-commit'
import { resetToRemote } from './reset-to-remote'
import type { PushQueueEntry } from './types'

type SWGitConfig = NonNullable<typeof workerState.config>

const authorOf = (config: SWGitConfig) => ({
  name: config.authorName ?? 'Admin',
  email: config.authorEmail ?? 'admin@prometheus.org',
})

/**
 * Re-baseline the local branch onto the fetched remote tip and replay the
 * queued commit's file changes as a single new commit whose only parent is
 * the remote tip. This recovers a force-pushed / unrelated / shallow-
 * diverged remote that `merge` cannot push: the new commit's pack
 * references nothing older than the remote tip, so the push is a clean
 * fast-forward on a `depth: 1` clone. The editor's edits win for the paths
 * they touched; every other file stays at the remote version.
 * @param config Validated SW git configuration.
 * @param entry Queued user commit to re-baseline and replay.
 * @returns The new commit oid (single parent = remote tip).
 */
export const runResetReplay = async (
  config: SWGitConfig,
  entry: PushQueueEntry
): Promise<string> => {
  const git = await loadGit()
  const { default: http } = await import('isomorphic-git/http/web')
  const opts = buildAuthOpts(config, http)
  const changes = await changedFilesOfCommit(entry.sha)
  const remote = await resetToRemote(opts, config.branch)
  await applyChanges(changes)
  const newSha = await git.commit({
    fs,
    dir: REPO_DIR,
    message: entry.message,
    author: authorOf(config),
  })
  log(
    'info',
    'git',
    `reset-replay ${entry.sha.slice(0, 7)} → ${newSha.slice(0, 7)} onto ${remote.slice(0, 7)}`
  )
  return newSha
}
