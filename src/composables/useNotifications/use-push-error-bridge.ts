import { onUnmounted } from 'vue'
import {
  type PushErrorEvent,
  SW_PUSH_ERROR_CHANNEL,
} from '@/sw/protocol/push-error'
import { notifyPushFailure } from './notify-push-failure'

const subscribe = (channel: BroadcastChannel): void => {
  channel.onmessage = (event: MessageEvent<PushErrorEvent>): void => {
    const data = event.data
    notifyPushFailure(data.reason, data.target)
  }
}

/**
 * Subscribe to SW-broadcast push errors and dispatch a typed
 * notification per event. Mount once near the app root so every
 * push failure surfaces to the user without coupling the SW to
 * the client store.
 * @returns void
 */
export const usePushErrorBridge = (): void => {
  const supported = typeof BroadcastChannel !== 'undefined'
  const channel = supported
    ? new BroadcastChannel(SW_PUSH_ERROR_CHANNEL)
    : undefined
  const noop = (): void => undefined
  ;(channel === undefined ? noop : () => subscribe(channel))()
  onUnmounted(() => channel?.close())
}
