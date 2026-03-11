import { routeRequest } from './handlers/route'
import { log } from './logging/logger'
import { workerState } from './state'

declare const self: ServiceWorkerGlobalScope

/**
 * Register the fetch event listener.
 * Intercepts /api/github/* only when the SW is ready.
 * Falls through to network when not ready (graceful degradation).
 */
export const registerFetchListener = (): void => {
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)
    if (!url.pathname.startsWith('/api/github/')) return
    if (workerState.state !== 'ready') return

    log('debug', 'cache', `intercept ${event.request.method} ${url.pathname}`)
    event.respondWith(routeRequest(event.request))
  })
}
