import { log } from '../logging/logger'
import { ensureVersionMatch } from './version-gate'

declare const self: ServiceWorkerGlobalScope

/**
 * Register SW lifecycle event listeners.
 * Install: skipWaiting for immediate activation.
 * Activate: version-check IndexedDB + claim clients.
 */
export const registerLifecycle = (): void => {
  self.addEventListener('install', () => {
    log('info', 'lifecycle', 'SW installed')
    self.skipWaiting()
  })

  self.addEventListener('activate', event => {
    log('info', 'lifecycle', 'SW activated')
    event.waitUntil(ensureVersionMatch().then(() => self.clients.claim()))
  })
}
