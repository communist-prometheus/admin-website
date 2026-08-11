import { routeRequest } from '../handlers/route'
import { errorResponse } from '../handlers/shared/json-response'
import { log } from '../logging/logger'
import { workerState } from '../state/state'
import { autoRecover } from './auto-recover'
import { handleInitRequest } from './messaging/handle-init-request'

declare const self: ServiceWorkerGlobalScope

/**
 * Confused-deputy guard: a `/api/github/*` WRITE (stage/commit/asset) must echo
 * the per-session nonce issued at init, so a same-origin script that never saw
 * the init response (an injected/XSS payload) cannot borrow the ambient token to
 * push commits. Reads (GET) are left open — the content repo is website content
 * bound for publication, and legitimate tooling reads it with a raw fetch.
 * Returns a JSON 403 on mismatch so the client's swFetch can re-init and retry.
 * @param request - The intercepted github request
 * @returns undefined when allowed, otherwise a 403 response
 */
const nonceRejection = (request: Request): Response | undefined =>
  request.method === 'GET' ||
  (request.headers.get('X-SW-Nonce') === workerState.nonce &&
    workerState.nonce !== undefined)
    ? undefined
    : errorResponse('SW nonce required', 403)

const guardAndRoute = async (request: Request): Promise<Response> => {
  if (workerState.state !== 'ready') {
    const ok = await autoRecover()
    if (!ok) return errorResponse('SW not ready', 503)
  }
  return nonceRejection(request) ?? routeRequest(request)
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

    log('debug', 'cache', `intercept ${event.request.method} ${pathname}`)
    event.respondWith(guardAndRoute(event.request))
  })
}
