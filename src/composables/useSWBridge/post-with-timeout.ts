import { Duration, Effect } from 'effect'
import type { SWRequest } from '@/sw/protocol'

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
 * Used for init (when no controller) and data fallback.
 * @param worker - Target ServiceWorker
 * @param message - Request payload
 * @returns Response from the SW
 */
export const postWithTimeout = <T>(
  worker: ServiceWorker,
  message: SWRequest
): Promise<T> =>
  Effect.runPromise(
    listen<T>(worker, message).pipe(
      Effect.timeoutFail({
        duration: TIMEOUT,
        onTimeout: () => new Error(`SW message timeout: ${message.type}`),
      })
    )
  )
