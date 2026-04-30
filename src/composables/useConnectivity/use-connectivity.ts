import { onMounted, onUnmounted, watch } from 'vue'
import { broadcastConnectivity } from './broadcast'
import { isOnline } from './connectivity-state'
import { HEARTBEAT_INTERVAL_MS, probeReachability } from './heartbeat'
import { isPageVisible } from './page-visibility'

let registered = false

const tick = async (): Promise<void> => {
  const visible = isPageVisible.value
  const skip = !visible
  await (skip
    ? Promise.resolve()
    : (async (): Promise<void> => {
        const ctrl = new AbortController()
        const reachable = await probeReachability(ctrl)
        isOnline.value = reachable
      })())
}

const handleOnline = (): void => {
  isOnline.value = true
}

const handleOffline = (): void => {
  isOnline.value = false
}

const wireListeners = (): void => {
  globalThis.addEventListener('online', handleOnline)
  globalThis.addEventListener('offline', handleOffline)
  setInterval(() => {
    void tick()
  }, HEARTBEAT_INTERVAL_MS)
  watch(isOnline, next => broadcastConnectivity(next), { immediate: true })
}

const ensureRegistered = (): void => {
  const already = registered
  registered = true
  const noop = (): void => undefined
  ;(already ? noop : wireListeners)()
}

/**
 * Reactive connectivity probe. Returns the shared `isOnline` ref
 * and registers `online`/`offline` listeners + a 30 s heartbeat
 * + an SW broadcast on the first call. Heartbeat skips ticks
 * while the tab is hidden so background tabs are silent.
 * @returns Object exposing the reactive `isOnline` ref.
 */
export const useConnectivity = () => {
  onMounted(() => {
    ensureRegistered()
  })
  onUnmounted(() => undefined)
  return { isOnline }
}
