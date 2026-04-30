import {
  type ConnectivityEvent,
  SW_CONNECTIVITY_CHANNEL,
} from '../protocol/connectivity'

let online = true
let wasOffline = false
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
 * True when the SW saw an offline transition since the last
 * successful drain. Used to gate the "Synced N changes" toast so
 * routine drains do not announce themselves.
 * @returns Cached "was offline since last drain" flag.
 */
export const wasOfflineSinceDrain = (): boolean => wasOffline

/** Reset the offline-since-drain flag. Call after a drain summary fires. */
export const acknowledgeOfflineDrain = (): void => {
  wasOffline = false
}

const handleTransition = async (next: boolean): Promise<void> => {
  const becameOnline = !online && next
  online = next
  wasOffline = wasOffline || !next
  await (becameOnline
    ? (async (): Promise<void> => {
        const { resetAttempts } = await import('../push-queue/reset-attempts')
        const { drainPushes } = await import('../push-queue/drain')
        await resetAttempts()
        await drainPushes()
      })()
    : Promise.resolve())
}

/**
 * Wire the SW to consume connectivity events broadcast by the
 * client. On every offline → online transition, reset retry
 * counters and trigger an immediate drain.
 * @returns void
 */
export const registerConnectivityListener = (): void => {
  channelOf().onmessage = (event: MessageEvent<ConnectivityEvent>): void => {
    void handleTransition(event.data.online)
  }
}
