import { log } from '../logging/logger'

declare const self: ServiceWorkerGlobalScope

/**
 * Register SW lifecycle event listeners.
 * Install: skipWaiting for immediate activation.
 * Activate: claim all clients.
 */
export const registerLifecycle = (): void => {
  self.addEventListener('install', () => {
    log('info', 'lifecycle', 'SW installed')
    self.skipWaiting()
  })

  self.addEventListener('activate', event => {
    log('info', 'lifecycle', 'SW activated')
    event.waitUntil(self.clients.claim())
  })
}
