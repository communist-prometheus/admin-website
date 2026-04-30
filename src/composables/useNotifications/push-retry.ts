import {
  type PushControlMessage,
  SW_PUSH_CONTROL_CHANNEL,
} from '@/sw/protocol/push-control'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_CONTROL_CHANNEL)
  return channel
}

/**
 * Ask the SW to retry the queued pushes immediately. Wired up to
 * the Retry CTA on terminal push-failure notifications and (in
 * the future) to a manual button on the sync badge.
 * @returns void
 */
export const requestPushRetry = (): void => {
  const msg: PushControlMessage = { type: 'retry-now' }
  channelOf().postMessage(msg)
}
