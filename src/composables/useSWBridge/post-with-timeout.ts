import type { SWRequest } from '@/sw/protocol'

const TIMEOUT = 15_000

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
  new Promise((resolve, reject) => {
    const channel = new MessageChannel()
    const timer = globalThis.setTimeout(() => {
      channel.port1.close()
      reject(new Error(`SW message timeout: ${message.type}`))
    }, TIMEOUT)

    channel.port1.onmessage = (event: MessageEvent<T>) => {
      clearTimeout(timer)
      channel.port1.close()
      resolve(event.data)
    }
    worker.postMessage(message, [channel.port2])
  })
