import { Effect, Option } from 'effect'

/**
 * Check if ServiceWorker API is available.
 * @returns Option containing the SW container
 */
export const swContainer = (): Option.Option<ServiceWorkerContainer> =>
  typeof navigator !== 'undefined' && 'serviceWorker' in navigator
    ? Option.some(navigator.serviceWorker)
    : Option.none()

/**
 * Check if sw.js exists and is a JavaScript resource.
 * Avoids noisy errors in dev mode where SW is not built.
 * @returns Effect yielding true when sw.js is available
 */
export const swScriptExists: Effect.Effect<boolean, never> =
  Effect.tryPromise(() => fetch('/sw.js', { method: 'HEAD' })).pipe(
    Effect.map(
      res => res.headers.get('content-type')?.includes('javascript') ?? false
    ),
    Effect.catchAll(() => Effect.succeed(false))
  )
