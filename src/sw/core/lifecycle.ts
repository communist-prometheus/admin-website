import { log } from '../logging/logger'
import { ensureVersionMatch } from './version-gate'

declare const self: ServiceWorkerGlobalScope

/*
 * scheduleRetry parks pending pushes behind a `setTimeout` that
 * dies with the SW. Without an activate-time drain a queued entry
 * whose retry timer fired into a dead SW sits in IndexedDB forever
 * until the user happens to make another commit — the silent-fail
 * mechanism behind "save said OK but nothing reached the remote".
 */
const drainOnActivate = async (): Promise<void> => {
  const { drainPushes } = await import('../push-queue/drain')
  await drainPushes()
}

/**
 * Register SW lifecycle event listeners.
 * Install: skipWaiting for immediate activation.
 * Activate: version-check IndexedDB + claim clients + drain any
 * pending pushes left behind by a previous SW eviction.
 */
export const registerLifecycle = (): void => {
  self.addEventListener('install', () => {
    log('info', 'lifecycle', 'SW installed')
    self.skipWaiting()
  })

  self.addEventListener('activate', event => {
    log('info', 'lifecycle', 'SW activated')
    event.waitUntil(
      ensureVersionMatch()
        .then(() => self.clients.claim())
        .then(() => drainOnActivate())
    )
  })
}
