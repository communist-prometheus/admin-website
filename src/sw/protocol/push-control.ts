/** BroadcastChannel name for client→SW push pipeline control. */
export const SW_PUSH_CONTROL_CHANNEL = 'sw-push-control'

/** Resolution strategies a user can apply per conflicted file. */
export type ResolveStrategy = 'mine' | 'theirs' | 'force-mine'

/** Control messages exchanged on the push-control channel. */
export type PushControlMessage =
  | { readonly type: 'retry-now' }
  | {
      readonly type: 'resolve-file'
      readonly file: string
      readonly strategy: ResolveStrategy
    }
  | { readonly type: 'finalize-resolution' }
