import {
  type ConnectivityEvent,
  SW_CONNECTIVITY_CHANNEL,
} from '@/sw/protocol/connectivity'

let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_CONNECTIVITY_CHANNEL)
  return channel
}

/**
 * Broadcast the current online state to the SW so the push queue
 * can decide whether to drain or hold. Clients call this whenever
 * the local `isOnline` ref flips.
 * @param online True when the network is reachable.
 * @returns void
 */
export const broadcastConnectivity = (online: boolean): void => {
  const event: ConnectivityEvent = { online, at: Date.now() }
  channelOf().postMessage(event)
}
