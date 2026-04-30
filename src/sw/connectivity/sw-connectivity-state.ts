import {
  type ConnectivityEvent,
  SW_CONNECTIVITY_CHANNEL,
} from '../protocol/connectivity'

let online = true
let channel: BroadcastChannel | undefined

const channelOf = (): BroadcastChannel => {
  channel ??= new BroadcastChannel(SW_CONNECTIVITY_CHANNEL)
  return channel
}

/**
 * True when the client most recently reported the network is up.
 * @returns Cached online state.
 */
export const isOnlineInSw = (): boolean => online

/**
 * Wire the SW to consume connectivity events broadcast by the
 * client. Called once at SW boot.
 * @returns void
 */
export const registerConnectivityListener = (): void => {
  channelOf().onmessage = (event: MessageEvent<ConnectivityEvent>): void => {
    online = event.data.online
  }
}
