import { onUnmounted, ref } from 'vue'
import {
  INITIAL_PUSH_STATE,
  type PushState,
  SW_PUSH_STATE_CHANNEL,
} from '@/sw/protocol'

/**
 * Subscribe to push pipeline state events broadcast by the SW.
 * Returns a reactive ref that mirrors the latest snapshot. The
 * subscription is torn down automatically on unmount.
 * @returns Reactive `state` ref reflecting the SW push pipeline.
 */
export const usePushState = () => {
  const state = ref<PushState>(INITIAL_PUSH_STATE)
  const supported = typeof BroadcastChannel !== 'undefined'
  const channel = supported
    ? new BroadcastChannel(SW_PUSH_STATE_CHANNEL)
    : undefined
  const wire = (ch: BroadcastChannel): void => {
    ch.onmessage = (event: MessageEvent<PushState>): void => {
      state.value = event.data
    }
  }
  const noop = (): void => undefined
  ;(channel === undefined ? noop : () => wire(channel))()
  onUnmounted(() => channel?.close())
  return { state }
}
