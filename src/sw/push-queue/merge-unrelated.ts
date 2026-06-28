import { log } from '../logging/logger'
import type { workerState } from '../state/state'
import { collectConflictFiles } from './collect-conflict-files'
import { isMergeConflict, type MergeOutcome } from './merge-classify'
import { runUnrelatedMerge } from './run-unrelated-merge'

type SWGitConfig = NonNullable<typeof workerState.config>

/**
 * Reconcile a remote whose history shares no ancestor with the
 * local clone — the state every browser clone fell into after the
 * content repo was force-pushed (identity rewrite). Identical
 * blobs merge cleanly; only a genuine same-path content divergence
 * surfaces as a conflict.
 * @param config Validated SW git configuration.
 * @returns Discriminated merge outcome (clean / conflict / fail).
 */
export const mergeUnrelated = async (
  config: SWGitConfig
): Promise<MergeOutcome> => {
  try {
    await runUnrelatedMerge(config)
    log('info', 'git', 'merged unrelated remote history after force-push')
    return { kind: 'clean' }
  } catch (error) {
    return isMergeConflict(error)
      ? { kind: 'conflict', files: await collectConflictFiles(error) }
      : { kind: 'fail', error }
  }
}
