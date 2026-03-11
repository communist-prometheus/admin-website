/**
 * Deferred promise that resolves when the Service Worker
 * has finished initializing its git repo (mock or clone).
 * Content stores should await this before making API calls.
 */

/** @type Resolve function for the deferred promise */
type ResolveFn = () => void

let resolve: ResolveFn

/**
 * Promise that resolves when SW is ready to serve API calls.
 * Awaited by content fetchers before hitting /api/github/*.
 */
export const swReady: Promise<void> = new Promise<void>(r => {
  resolve = r
})

/**
 * Signal that the SW has finished initialization.
 * Called after SW_INIT reply confirms repo readiness.
 */
export const markSWReady = (): void => {
  resolve()
}
