import { watch } from 'vue'
import { isOnline, useConnectivity } from '@/composables/useConnectivity'
import { notifyNetworkDown } from './notify-network-down'
import { requestPushRetry } from './push-retry'

/**
 * Surface a sticky network notification on every offline
 * transition and ensure the connectivity heartbeat is registered.
 * Notification CTA is wired to the manual retry control message
 * so the user can probe a recovery without waiting on the next
 * heartbeat tick.
 * @returns void
 */
export const useOfflineWatcher = (): void => {
  useConnectivity()
  watch(
    isOnline,
    (next, prev) => {
      const transitionedOffline = prev !== false && next === false
      const fire = transitionedOffline
        ? () => notifyNetworkDown(requestPushRetry)
        : (): void => undefined
      fire()
    },
    { immediate: false }
  )
}
