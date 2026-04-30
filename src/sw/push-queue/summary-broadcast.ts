import {
  type PushSummaryEvent,
  SW_PUSH_SUMMARY_CHANNEL,
} from '../protocol/push-summary'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_SUMMARY_CHANNEL)
  return channel
}

/**
 * Broadcast a drain summary so the client can surface a "Synced N
 * changes" toast. Suppressed when no entries actually drained.
 * @param synced Number of successful pushes in the just-finished drain.
 * @returns void
 */
export const publishPushSummary = (synced: number): void => {
  const event: PushSummaryEvent = { synced, at: Date.now() }
  channelOf().postMessage(event)
}
