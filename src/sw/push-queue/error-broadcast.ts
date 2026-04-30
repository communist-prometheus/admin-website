import {
  type PushErrorEvent,
  type PushFailureReason,
  SW_PUSH_ERROR_CHANNEL,
} from '../protocol/push-error'
import type { PushQueueEntry } from './types'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_ERROR_CHANNEL)
  return channel
}

/**
 * Broadcast a classified push failure event so the client can
 * surface a typed notification. The `terminal` flag tells the UI
 * whether retries are exhausted or the failure is non-retriable
 * — only terminal events surface a Retry CTA.
 * @param entry Queue entry whose push failed.
 * @param reason Classified failure reason.
 * @param terminal True when no further retries are scheduled.
 * @returns void
 */
export const publishPushError = (
  entry: PushQueueEntry,
  reason: PushFailureReason,
  terminal: boolean
): void => {
  const event: PushErrorEvent = {
    reason,
    sha: entry.sha,
    target: entry.branch,
    at: Date.now(),
    terminal,
    attempt: entry.attempt ?? 1,
  }
  channelOf().postMessage(event)
}
