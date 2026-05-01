import { Effect, Option } from 'effect'
import { loadConfig } from '../git/repo/persist-config'
import { checkRepoAndSync } from '../git/sync/sync-repo'
import { log } from '../logging/logger'
import { workerState } from '../state/state'

let pending: Promise<boolean> | undefined

/*
 * Pending push entries live in IndexedDB and outlive SW evictions,
 * but the `setTimeout`-based retry that scheduleRetry sets up does
 * NOT — it lives in the in-memory SW that just got evicted. So the
 * queue can accumulate stuck entries that have no trigger to drain
 * until the user happens to commit again. Kicking a drain right
 * after auto-recover is what unblocks them in practice.
 */
const drainAfterRecover = async (): Promise<void> => {
  const { drainPushes } = await import('../push-queue/drain')
  await drainPushes()
}

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
          if (workerState.state === 'ready') void drainAfterRecover()
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
 * Deduplicated: concurrent callers share a single recovery attempt.
 * @returns true if recovery succeeded and SW is ready
 */
export const autoRecover = (): Promise<boolean> => {
  if (pending) return pending
  pending = Effect.runPromise(recoverEffect).finally(() => {
    pending = undefined
  })
  return pending
}
