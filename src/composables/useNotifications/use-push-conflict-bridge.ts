import { onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConflictsStore } from '@/stores/conflicts'
import {
  type PushConflictEvent,
  SW_PUSH_CONFLICT_CHANNEL,
} from '@/sw/protocol/push-conflict'
import { notifyConflictDetected } from './notify-conflict-detected'

const subscribe = (
  channel: BroadcastChannel,
  store: ReturnType<typeof useConflictsStore>,
  goToConflicts: () => void
): void => {
  channel.onmessage = (event: MessageEvent<PushConflictEvent>): void => {
    store.record({ ...event.data })
    notifyConflictDetected(event.data.files, goToConflicts)
  }
}

/**
 * Subscribe to SW-broadcast merge conflict events. Each event is
 * persisted into the conflicts store and surfaces a sticky toast
 * with a "Resolve" CTA that navigates to `/conflicts`.
 * @returns void
 */
export const usePushConflictBridge = (): void => {
  const supported = typeof BroadcastChannel !== 'undefined'
  const channel = supported
    ? new BroadcastChannel(SW_PUSH_CONFLICT_CHANNEL)
    : undefined
  const store = useConflictsStore()
  const router = useRouter()
  const goToConflicts = (): void => {
    void router.push('/conflicts')
  }
  const noop = (): void => undefined
  ;(channel === undefined
    ? noop
    : () => subscribe(channel, store, goToConflicts))()
  onUnmounted(() => channel?.close())
}
