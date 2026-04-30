/**
 * Reasons a push attempt may fail. Classification drives the
 * notification copy and the downstream retry policy.
 */
export type PushFailureReason =
  | 'network'
  | 'auth'
  | 'non-fast-forward'
  | 'validation'
  | 'unknown'

/** BroadcastChannel name carrying classified push error events. */
export const SW_PUSH_ERROR_CHANNEL = 'sw-push-error'

/** Single push failure event broadcast to the client. */
export type PushErrorEvent = {
  readonly reason: PushFailureReason
  readonly sha: string
  readonly target: string
  readonly at: number
}
