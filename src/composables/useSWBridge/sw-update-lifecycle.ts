import { log } from './sw-log'

/**
 * Wire up listeners that detect when a new SW activates and reload
 * the page so the client code always matches the running SW.
 * Also proactively checks for updates when the tab regains focus.
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
    if (!globalThis.document.hidden) {
      void reg.update().catch(() => {
        /* silent — network may be offline */
      })
    }
  })
}
