import {
  type PushConflictEvent,
  SW_PUSH_CONFLICT_CHANNEL,
} from '../protocol/push-conflict'
import type { PushQueueEntry } from './types'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_CONFLICT_CHANNEL)
  return channel
}

/**
 * Broadcast an unresolved-conflict event so the client can list
 * affected files in the conflict view (4.2) and offer per-file
 * resolution (4.3+).
 * @param entry Queue entry whose push triggered the merge attempt.
 * @param files Conflict file paths reported by isomorphic-git.
 * @returns void
 */
export const publishPushConflict = (
  entry: PushQueueEntry,
  files: ReadonlyArray<string>
): void => {
  const event: PushConflictEvent = {
    sha: entry.sha,
    target: entry.branch,
    files,
    at: Date.now(),
  }
  channelOf().postMessage(event)
}
