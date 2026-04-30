import { Match } from 'effect'
import { finalizeResolution } from '../conflicts/finalize'
import { resolveFile } from '../conflicts/resolve-file'
import {
  type PushControlMessage,
  SW_PUSH_CONTROL_CHANNEL,
} from '../protocol/push-control'

let controlChannel: BroadcastChannel | undefined

const handleRetry = async (): Promise<void> => {
  const { drainPushes } = await import('./drain')
  await drainPushes()
}

const dispatch = async (msg: PushControlMessage): Promise<void> => {
  await Match.value(msg).pipe(
    Match.discriminator('type')('retry-now', () => handleRetry()),
    Match.discriminator('type')('resolve-file', ({ file, strategy }) =>
      resolveFile(file, strategy)
    ),
    Match.discriminator('type')('finalize-resolution', () =>
      finalizeResolution().then(() => undefined)
    ),
    Match.exhaustive
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
