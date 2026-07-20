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
  /*
   * Reload only when an UPDATE swaps the controller — never on the first,
   * uncontrolled load. A first visit fires `controllerchange` from the
   * SW's initial `clients.claim()`, but that page already runs the latest
   * network-loaded code, so the reload is pointless — and, landing late
   * under load, it re-inits Pinia mid-interaction, wiping the in-memory
   * notification queue (a rapid burst counted 1→2→3→4→1 in a trace). The
   * `updatefound → activated` reload is dropped for the same reason:
   * activation precedes control, so it fired BEFORE the claim and then
   * `controllerchange` reloaded again. `controllerchange` alone covers
   * updates (old SW → new SW) since activation always claims.
   */
  const controlledAtStart = navigator.serviceWorker.controller !== null

  reg.addEventListener('updatefound', () => {
    if (reg.installing)
      log('info', 'New SW version found, waiting for control')
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlledAtStart) return
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
