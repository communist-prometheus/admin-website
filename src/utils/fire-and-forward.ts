/**
 * Fire-and-forget a promise without swallowing its rejection. Any
 * error that escapes the inner pipeline is rethrown on a microtask
 * so it reaches `window.unhandledrejection` (visible in DevTools,
 * forwardable to Sentry/etc.) rather than the silent
 * `.catch(() => {})` graveyard.
 *
 * Use ONLY when the caller cannot await the promise (background
 * refresh during another async flow). For everything else, just
 * `await` and let the error propagate.
 * @param p - The promise to detach from the call stack
 */
export const fireAndForward = (p: Promise<unknown>): void => {
  p.then(undefined, e => {
    queueMicrotask(() => {
      throw e
    })
  })
}
