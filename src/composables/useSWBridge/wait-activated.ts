import { Duration, Effect } from 'effect'

const TIMEOUT = Duration.seconds(10)

/**
 * Wait for a worker to reach the activated state.
 * Listens for statechange events with a timeout.
 * @param worker - The installing or waiting worker
 * @returns Effect yielding the activated worker
 */
export const waitActivated = (
  worker: ServiceWorker
): Effect.Effect<ServiceWorker, Error> =>
  Effect.async<ServiceWorker>(resume => {
    const check = (): void => {
      if (worker.state === 'activated') resume(Effect.succeed(worker))
    }
    worker.addEventListener('statechange', check)
    check()
  }).pipe(
    Effect.timeoutFail({
      duration: TIMEOUT,
      onTimeout: () => new Error('SW activation timeout'),
    })
  )
