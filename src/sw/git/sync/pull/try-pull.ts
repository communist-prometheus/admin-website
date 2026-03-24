import { Effect } from 'effect'
import { log } from '../../../logging/logger'
import type { SWGitConfig } from '../../../protocol'

const formatError = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

const pullEffect = (config: SWGitConfig): Effect.Effect<boolean, never> =>
  Effect.tryPromise(async () => {
    const { pullRepo } = await import('./pull-repo')
    await pullRepo(config)
    return true
  }).pipe(
    Effect.tapError(e =>
      Effect.sync(() =>
        log('warn', 'git', `Pull failed, will re-clone: ${formatError(e)}`)
      )
    ),
    Effect.catchAll(() => Effect.succeed(false))
  )

/**
 * Attempt to pull. Returns false on non-ff (force push).
 * @param config - Repository configuration
 * @returns true if pull succeeded
 */
export const tryPull = (config: SWGitConfig): Promise<boolean> =>
  Effect.runPromise(pullEffect(config))
