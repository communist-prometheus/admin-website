import { routeRequest } from '../handlers/route'
import { errorResponse } from '../handlers/shared/json-response'
import { log } from '../logging/logger'
import { workerState } from '../state/state'
import { autoRecover } from './auto-recover'
import { handleInitRequest } from './messaging/handle-init-request'

declare const self: ServiceWorkerGlobalScope

/**
 * Auto-recover from SW restart, then route the request.
 * Returns a JSON `{ error }` payload on failure so the client decoder
 * can surface a readable message.
 * @param request - The intercepted fetch request
 * @returns Routed response or JSON error
 */
const recoverAndRoute = async (request: Request): Promise<Response> => {
  const ok = await autoRecover()
  if (ok) return routeRequest(request)
  return errorResponse('SW not ready', 503)
}

/**
 * Register the fetch event listener.
 * Intercepts /api/sw/init always (for initialization).
 * Auto-recovers from browser-triggered SW restarts.
 */
export const registerFetchListener = (): void => {
  self.addEventListener('fetch', event => {
    const { pathname } = new URL(event.request.url)

    if (pathname === '/api/sw/init') {
      event.respondWith(handleInitRequest(event.request))
      return
    }

    if (!pathname.startsWith('/api/github/')) return

    if (workerState.state !== 'ready') {
      event.respondWith(recoverAndRoute(event.request))
      return
    }

    log('debug', 'cache', `intercept ${event.request.method} ${pathname}`)
    event.respondWith(routeRequest(event.request))
  })
}
