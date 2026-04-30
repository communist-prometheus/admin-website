import { type PushState, SW_PUSH_STATE_CHANNEL } from '../protocol/push-state'

let lastState: PushState = { status: 'idle', pending: 0 }
let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_PUSH_STATE_CHANNEL)
  return channel
}

const sendIfChanged = (prev: PushState, next: PushState): void => {
  const changed = prev.status !== next.status || prev.pending !== next.pending
  const fire = changed
    ? () => channelOf().postMessage(next)
    : (): void => undefined
  fire()
}

/**
 * Broadcast the latest push pipeline snapshot to all subscribed
 * clients. The last known state is cached so repeat publishers
 * (drain ticks, error retries) skip redundant emissions.
 * @param next New push state to broadcast.
 * @returns void
 */
export const publishPushState = (next: PushState): void => {
  const prev = lastState
  lastState = next
  sendIfChanged(prev, next)
}

/**
 * Read the cached push state without broadcasting. Useful when a
 * fresh subscriber asks for the current value.
 * @returns Last broadcast state.
 */
export const currentPushState = (): PushState => lastState
