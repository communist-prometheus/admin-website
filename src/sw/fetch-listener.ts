import { handleInit } from './handle-init'
import { routeRequest } from './handlers/route'
import { log } from './logging/logger'
import type { SWGitConfig } from './protocol'
import { workerState } from './state'

declare const self: ServiceWorkerGlobalScope

/**
 * Handle POST /api/sw/init — initialize the SW with config.
 * Accepted even when state !== 'ready' (this is how we GET to ready).
 * @param request - Incoming init request
 * @returns JSON response
 */
const handleInitRequest = (request: Request): Promise<Response> =>
  request.json().then(
    (config: SWGitConfig) =>
      new Promise<Response>(resolve => {
        handleInit(config, data => {
          resolve(
            new Response(JSON.stringify(data), {
              headers: { 'content-type': 'application/json' },
            })
          )
        })
      })
  )

/**
 * Register the fetch event listener.
 * Intercepts /api/sw/init always (for initialization).
 * Intercepts /api/github/* only when the SW is ready.
 */
export const registerFetchListener = (): void => {
  self.addEventListener('fetch', event => {
    const url = new URL(event.request.url)

    if (url.pathname === '/api/sw/init' && event.request.method === 'POST') {
      event.respondWith(handleInitRequest(event.request))
      return
    }

    if (!url.pathname.startsWith('/api/github/')) return
    if (workerState.state !== 'ready') return

    log('debug', 'cache', `intercept ${event.request.method} ${url.pathname}`)
    event.respondWith(routeRequest(event.request))
  })
}
