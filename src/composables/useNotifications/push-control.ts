import {
  type PushControlMessage,
  type ResolveStrategy,
  SW_PUSH_CONTROL_CHANNEL,
} from '@/sw/protocol/push-control'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_CONTROL_CHANNEL)
  return channel
}

const send = (msg: PushControlMessage): void => {
  channelOf().postMessage(msg)
}

/**
 * Ask the SW to retry the queued pushes immediately. Wired up to
 * the Retry CTA on terminal push-failure notifications.
 * @returns void
 */
export const requestPushRetry = (): void => {
  send({ type: 'retry-now' })
}

/**
 * Ask the SW to apply a resolution strategy to a single
 * conflicted file. The SW rewrites the working tree, stages the
 * file, and remembers the strategy for the finalize step.
 * @param file Path of the conflicted file relative to repo root.
 * @param strategy User-chosen resolution strategy.
 * @returns void
 */
export const requestResolveFile = (
  file: string,
  strategy: ResolveStrategy
): void => {
  send({ type: 'resolve-file', file, strategy })
}

/**
 * Ask the SW to finalize the conflict resolution: commit the
 * staged files and push the merge commit (force-with-lease when
 * any file used `force-mine`).
 * @returns void
 */
export const requestFinalizeResolution = (): void => {
  send({ type: 'finalize-resolution' })
}
