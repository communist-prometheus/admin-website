import { Duration, Effect } from 'effect'
import type { SWRequest } from '@/sw/protocol'
import { stampTraceparent } from './stamp-traceparent'

const TIMEOUT = Duration.seconds(15)

/**
 * Listen for a single MessageChannel response.
 * @param worker - Target ServiceWorker
 * @param message - Request payload
 * @returns Effect yielding the SW response data
 */
const listen = <T>(
  worker: ServiceWorker,
  message: SWRequest
): Effect.Effect<T, never> =>
  Effect.async<T>(resume => {
    const ch = new MessageChannel()
    ch.port1.onmessage = (e: MessageEvent<T>) => {
      ch.port1.close()
      resume(Effect.succeed(e.data))
    }
    worker.postMessage(message, [ch.port2])
  })

/**
 * Send a message to a ServiceWorker via MessageChannel.
 * Stamps the active client span's traceparent on the envelope
 * so the SW can correlate logs and outbound calls.
 * @param worker - Target ServiceWorker
 * @param message - Request payload
 * @returns Response from the SW
 */
export const postWithTimeout = <T>(
  worker: ServiceWorker,
  message: SWRequest
): Promise<T> => {
  const stamped = stampTraceparent(message)
  return Effect.runPromise(
    listen<T>(worker, stamped).pipe(
      Effect.timeoutFail({
        duration: TIMEOUT,
        onTimeout: () => new Error(`SW message timeout: ${stamped.type}`),
      })
    )
  )
}
