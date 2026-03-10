import { log } from './logging/logger'

declare const self: ServiceWorkerGlobalScope

/**
 * Register the fetch event listener.
 * Phase 1: log and passthrough (no interception).
 */
export const registerFetchListener = (): void => {
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)
    if (!url.pathname.startsWith('/api/github/')) return
    log(
      'debug',
      'cache',
      `passthrough ${event.request.method} ${url.pathname}`
    )
  })
}
