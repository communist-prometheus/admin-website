import { Effect } from 'effect'
import { waitActivated } from './wait-activated'

/**
 * Pick the pending worker from a registration.
 * @param reg - ServiceWorkerRegistration to inspect
 * @returns Effect yielding the installing or waiting worker
 */
const pendingWorker = (
  reg: ServiceWorkerRegistration
): Effect.Effect<ServiceWorker, Error> => {
  const w = reg.installing ?? reg.waiting
  return w ? Effect.succeed(w) : Effect.fail(new Error('No SW worker found'))
}

/**
 * Resolve the active worker from current registration.
 * @param reg - ServiceWorkerRegistration to inspect
 * @returns Effect yielding the active ServiceWorker
 */
const fromReg = (
  reg: ServiceWorkerRegistration
): Effect.Effect<ServiceWorker, Error> =>
  reg.active
    ? Effect.succeed(reg.active)
    : pendingWorker(reg).pipe(Effect.flatMap(waitActivated))

/**
 * Get the active Service Worker.
 * Checks controller first, then resolves from registration.
 * @returns Active ServiceWorker instance
 */
export const getActiveWorker = async (): Promise<ServiceWorker> =>
  Effect.runPromise(
    navigator.serviceWorker.controller
      ? Effect.succeed(navigator.serviceWorker.controller)
      : Effect.tryPromise({
          try: () => navigator.serviceWorker.getRegistrations(),
          catch: () => new Error('ServiceWorker not supported'),
        }).pipe(
          Effect.flatMap(regs =>
            regs[0]
              ? fromReg(regs[0])
              : Effect.fail(new Error('No SW registration'))
          )
        )
  )
