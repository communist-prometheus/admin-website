import { Effect, Option } from 'effect'
import { loadConfig } from '../git/repo/persist-config'
import { checkRepoAndSync } from '../git/sync/sync-repo'
import { log } from '../logging/logger'
import { workerState } from '../state/state'

const recoverEffect: Effect.Effect<boolean, never> = Effect.tryPromise(() =>
  loadConfig()
).pipe(
  Effect.map(Option.fromNullable),
  Effect.flatMap(
    Option.match({
      onNone: () => Effect.succeed(false),
      onSome: config =>
        Effect.tryPromise(async () => {
          workerState.config = config
          await checkRepoAndSync(config)
          log('info', 'lifecycle', 'Auto-recovered after SW restart')
          return workerState.state === 'ready'
        }),
    })
  ),
  Effect.tapError(err =>
    Effect.sync(() =>
      log('error', 'lifecycle', `Auto-recover failed: ${err}`)
    )
  ),
  Effect.catchAll(() => Effect.succeed(false))
)

/**
 * Attempt to auto-recover after browser-triggered SW restart.
 * Loads persisted config from IndexedDB and re-verifies repo.
 * @returns true if recovery succeeded and SW is ready
 */
export const autoRecover = (): Promise<boolean> =>
  Effect.runPromise(recoverEffect)
