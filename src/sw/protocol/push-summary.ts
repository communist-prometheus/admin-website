/** BroadcastChannel name for SW→client drain summary events. */
export const SW_PUSH_SUMMARY_CHANNEL = 'sw-push-summary'

/** Emitted after a successful drain that began while offline. */
export type PushSummaryEvent = {
  readonly synced: number
  readonly at: number
}
