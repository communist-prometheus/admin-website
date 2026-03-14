import { autoRecover } from './auto-recover'
import { handleInitRequest } from './handle-init-request'
import { routeRequest } from './handlers/route'
import { log } from './logging/logger'
import { workerState } from './state'

declare const self: ServiceWorkerGlobalScope

/**
 * Auto-recover from SW restart, then route the request.
 * @param request - The intercepted fetch request
 * @returns Routed response or 503 if recovery fails
 */
const recoverAndRoute = async (request: Request): Promise<Response> => {
  const ok = await autoRecover()
  if (ok) return routeRequest(request)
  return new Response(JSON.stringify({ error: 'SW not ready' }), {
    status: 503,
    headers: { 'content-type': 'application/json' },
  })
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
