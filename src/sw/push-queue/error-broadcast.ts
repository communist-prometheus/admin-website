import {
  type PushErrorEvent,
  SW_PUSH_ERROR_CHANNEL,
} from '../protocol/push-error'
import { classifyPushError } from './classify-error'
import type { PushQueueEntry } from './types'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_ERROR_CHANNEL)
  return channel
}

/**
 * Broadcast a classified push failure event so the client can
 * surface a typed notification. The reason is derived from the
 * raw error via `classifyPushError`.
 * @param entry Queue entry whose push failed.
 * @param error Raw error from the push pipeline.
 * @returns void
 */
export const publishPushError = (
  entry: PushQueueEntry,
  error: unknown
): void => {
  const event: PushErrorEvent = {
    reason: classifyPushError(error),
    sha: entry.sha,
    target: entry.branch,
    at: Date.now(),
  }
  channelOf().postMessage(event)
}
