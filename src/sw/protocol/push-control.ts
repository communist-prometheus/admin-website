/** BroadcastChannel name for client→SW push pipeline control. */
export const SW_PUSH_CONTROL_CHANNEL = 'sw-push-control'

/** Control message asking the SW to drain the queue immediately. */
export type PushControlMessage = { readonly type: 'retry-now' }
