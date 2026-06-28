import { Effect } from 'effect'
import type { SWGitConfig } from '../../protocol'
import { listPending } from '../../push-queue'
import { isMock } from '../is-mock'
import { markReady } from './mark-ready'
import { tryPull } from './pull/try-pull'
import { freshClone, initMock, repoExists } from './sync-helpers'

/**
 * Sync repo: pull if exists, clone if not.
 * Falls back to wipe+clone on pull failure (force push).
 * @param config - SW git configuration
 * @returns Promise resolving when sync completes
 */
export const checkRepoAndSync = (config: SWGitConfig): Promise<void> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const exists = yield* repoExists(config)
      if (!exists)
        return yield* isMock(config) ? initMock : freshClone(config)
      if (isMock(config)) return markReady()
      const pulled = yield* Effect.promise(() => tryPull(config))
      // A diverged clone that still holds unpushed commits must NOT be
      // wiped — freshClone deletes those commits (the queue lives in a
      // separate store and would orphan), silently losing the edit. Keep
      // the clone; the drain's reset-onto-remote recovery reconciles it.
      // Only reclone when there is no unpushed work to lose.
      const pending = pulled
        ? 0
        : (yield* Effect.promise(() => listPending())).length
      return pulled || pending > 0 ? markReady() : yield* freshClone(config)
    })
  )
