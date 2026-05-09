import { log } from './sw-log'

const NETWORK_PATTERNS = ['Failed to fetch', 'Load failed', 'NetworkError']
const isOfflineError = (e: unknown): boolean =>
  e instanceof TypeError && NETWORK_PATTERNS.some(p => e.message.includes(p))

/**
 * Wire up listeners that detect when a new SW activates and reload
 * the page so the client code always matches the running SW.
 * Also proactively checks for updates when the tab regains focus.
 *
 * The visibility-driven `reg.update()` filters offline TypeError'и
 * (the user is on a flaky connection — that's expected) but
 * rethrows anything else so genuine SW-update failures surface
 * instead of being eaten by a blanket `.catch(() => {})`.
 * @param reg - ServiceWorkerRegistration to monitor
 */
export const wireUpdateLifecycle = (reg: ServiceWorkerRegistration): void => {
  reg.addEventListener('updatefound', () => {
    const installing = reg.installing
    if (!installing) return
    log('info', 'New SW version found, waiting for activation')
    installing.addEventListener('statechange', () => {
      if (installing.state === 'activated') {
        log('info', 'New SW activated — reloading page')
        globalThis.location.reload()
      }
    })
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    log('info', 'SW controller changed — reloading page')
    globalThis.location.reload()
  })

  globalThis.document?.addEventListener('visibilitychange', () => {
    if (globalThis.document.hidden) return
    reg.update().catch(e => {
      if (isOfflineError(e)) return
      throw e
    })
  })
}
