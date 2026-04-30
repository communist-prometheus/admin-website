import { onMounted, onUnmounted } from 'vue'
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

const ensureRegistered = (): void => {
  const already = registered
  registered = true
  const wire = (): void => {
    globalThis.addEventListener('online', handleOnline)
    globalThis.addEventListener('offline', handleOffline)
    setInterval(() => {
      void tick()
    }, HEARTBEAT_INTERVAL_MS)
  }
  const noop = (): void => undefined
  ;(already ? noop : wire)()
}

/**
 * Reactive connectivity probe. Returns the shared `isOnline` ref
 * and registers `online`/`offline` listeners plus a 30s heartbeat
 * when called for the first time. The heartbeat skips ticks while
 * the tab is hidden so background tabs don't generate traffic.
 * @returns Object exposing the reactive `isOnline` ref.
 */
export const useConnectivity = () => {
  onMounted(() => {
    ensureRegistered()
  })
  onUnmounted(() => undefined)
  return { isOnline }
}
