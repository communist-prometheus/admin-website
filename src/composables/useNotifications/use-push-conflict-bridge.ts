import { onUnmounted } from 'vue'
import {
  type PushConflictEvent,
  SW_PUSH_CONFLICT_CHANNEL,
} from '@/sw/protocol/push-conflict'
import { notifyConflictDetected } from './notify-conflict-detected'

let pendingConflict: PushConflictEvent | undefined

/**
 * Read the most recent conflict event seen by the bridge. Used by
 * the conflict view to render the file list without re-listening
 * on the channel.
 * @returns Last conflict event, or undefined when none yet.
 */
export const lastConflictEvent = (): PushConflictEvent | undefined =>
  pendingConflict

const dispatch = (event: PushConflictEvent): void => {
  pendingConflict = event
  notifyConflictDetected(event.files)
}

const subscribe = (channel: BroadcastChannel): void => {
  channel.onmessage = (event: MessageEvent<PushConflictEvent>): void => {
    dispatch(event.data)
  }
}

/**
 * Subscribe to SW-broadcast merge conflict events and dispatch a
 * sticky notification per occurrence. The most recent event is
 * cached for later inspection by the conflict view (4.2+).
 * @returns void
 */
export const usePushConflictBridge = (): void => {
  const supported = typeof BroadcastChannel !== 'undefined'
  const channel = supported
    ? new BroadcastChannel(SW_PUSH_CONFLICT_CHANNEL)
    : undefined
  const noop = (): void => undefined
  ;(channel === undefined ? noop : () => subscribe(channel))()
  onUnmounted(() => channel?.close())
}
