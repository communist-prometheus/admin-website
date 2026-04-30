import { Match } from 'effect'
import {
  type PushControlMessage,
  SW_PUSH_CONTROL_CHANNEL,
} from '../protocol/push-control'

let controlChannel: BroadcastChannel | undefined

const dispatch = async (msg: PushControlMessage): Promise<void> => {
  await Match.value(msg.type).pipe(
    Match.when('retry-now', async () => {
      const { drainPushes } = await import('./drain')
      await drainPushes()
    }),
    Match.orElse(async () => undefined)
  )
}

/**
 * Subscribe the SW to client-issued push control messages. The
 * channel handle is cached so re-registering is a no-op. Mount
 * once at SW boot.
 * @returns void
 */
export const registerPushControlListener = (): void => {
  controlChannel ??= new BroadcastChannel(SW_PUSH_CONTROL_CHANNEL)
  controlChannel.onmessage = (
    event: MessageEvent<PushControlMessage>
  ): void => {
    void dispatch(event.data)
  }
}
