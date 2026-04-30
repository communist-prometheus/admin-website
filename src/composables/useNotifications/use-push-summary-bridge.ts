import { onUnmounted } from 'vue'
import {
  type PushSummaryEvent,
  SW_PUSH_SUMMARY_CHANNEL,
} from '@/sw/protocol/push-summary'
import { notifyInfo } from './notify-info'

const subscribe = (channel: BroadcastChannel): void => {
  channel.onmessage = (event: MessageEvent<PushSummaryEvent>): void => {
    notifyInfo(`Synced ${event.data.synced} change(s)`)
  }
}

/**
 * Subscribe to SW-broadcast drain summaries and dispatch a
 * transient info notification per event. Mount once near the app
 * root.
 * @returns void
 */
export const usePushSummaryBridge = (): void => {
  const supported = typeof BroadcastChannel !== 'undefined'
  const channel = supported
    ? new BroadcastChannel(SW_PUSH_SUMMARY_CHANNEL)
    : undefined
  const noop = (): void => undefined
  ;(channel === undefined ? noop : () => subscribe(channel))()
  onUnmounted(() => channel?.close())
}
