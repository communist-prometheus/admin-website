import { onUnmounted } from 'vue'
import {
  type PushErrorEvent,
  SW_PUSH_ERROR_CHANNEL,
} from '@/sw/protocol/push-error'
import { notifyPushFailure } from './notify-push-failure'
import { requestPushRetry } from './push-retry'

const RETRIABLE_REASONS: ReadonlySet<string> = new Set(['network', 'unknown'])

const dispatch = (event: PushErrorEvent): void => {
  const offerRetry = event.terminal && RETRIABLE_REASONS.has(event.reason)
  notifyPushFailure(
    event.reason,
    event.target,
    offerRetry ? requestPushRetry : undefined
  )
}

const subscribe = (channel: BroadcastChannel): void => {
  channel.onmessage = (event: MessageEvent<PushErrorEvent>): void => {
    dispatch(event.data)
  }
}

/**
 * Subscribe to SW-broadcast push errors and dispatch a typed
 * notification per event. Terminal failures on retriable reasons
 * (network / unknown) get a Retry CTA wired to the manual SW
 * control channel.
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
