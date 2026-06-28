import type { SWGitConfig } from '../protocol'
import { collectConflictFiles } from './collect-conflict-files'
import { isMergeConflict, type MergeOutcome } from './merge-classify'
import { runResetReplay } from './run-reset-replay'
import type { PushQueueEntry } from './types'

const conflictOutcome = async (error: unknown): Promise<MergeOutcome> => ({
  kind: 'conflict',
  files: await collectConflictFiles(error),
})

const rebaseOutcome = async (
  config: SWGitConfig,
  entry: PushQueueEntry
): Promise<MergeOutcome> => {
  try {
    return { kind: 'rebased', sha: await runResetReplay(config, entry) }
  } catch (error) {
    return { kind: 'fail', error }
  }
}

/**
 * Classify a failed `git.pull` into a recovery outcome. A genuine same-path
 * content conflict keeps the visual-merge flow; everything else (a
 * force-pushed / unrelated remote, or a shallow clone whose common ancestor
 * sits below the depth:1 boundary) is recovered by reset-onto-remote +
 * replay — the only strategy that yields a commit a shallow clone can push.
 * @param config Validated SW git configuration.
 * @param entry Queued user commit (replayed on recovery).
 * @param error Raw error thrown by `git.pull`.
 * @returns Discriminated outcome (conflict / rebased / fail).
 */
export const classifyMergeError = (
  config: SWGitConfig,
  entry: PushQueueEntry,
  error: unknown
): Promise<MergeOutcome> =>
  isMergeConflict(error)
    ? conflictOutcome(error)
    : rebaseOutcome(config, entry)
