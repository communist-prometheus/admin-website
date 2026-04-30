/** Status of the SW push pipeline as broadcast to the UI. */
export type PushStatus = 'idle' | 'syncing' | 'error'

/** Live snapshot of the SW push queue state. */
export type PushState = {
  readonly status: PushStatus
  readonly pending: number
}

/** BroadcastChannel name for push state events. */
export const SW_PUSH_STATE_CHANNEL = 'sw-push-state'

/** Initial state when no SW activity is observed. */
export const INITIAL_PUSH_STATE: PushState = {
  status: 'idle',
  pending: 0,
}
