/**
 * Reasons a push attempt may fail. Classification drives the
 * notification copy and downstream retry policy in Epic 2.
 */
export type PushFailureReason =
  | 'network'
  | 'auth'
  | 'non-fast-forward'
  | 'validation'
  | 'unknown'
