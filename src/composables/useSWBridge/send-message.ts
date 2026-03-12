import type { SWRequest } from '@/sw/protocol'
import { getActiveWorker } from './get-active-worker'
import { postWithTimeout } from './post-with-timeout'

const MAX_RETRIES = 4

/**
 * Queued tasks for sequential processing.
 * Serializing messages avoids concurrent MessageChannel
 * issues in WebKit where ports can be dropped under load.
 */
let queue: Promise<unknown> = Promise.resolve()

/**
 * Send a message to the SW with automatic retry and queuing.
 * Messages are serialized to avoid WebKit concurrency bugs.
 * @param message - The message to send
 * @returns Promise resolving to the SW's response
 */
export const sendSWMessage = <T>(message: SWRequest): Promise<T> => {
  const task = queue.then(async () => {
    let lastError: Error | undefined

    for (let i = 0; i <= MAX_RETRIES; i++) {
      try {
        const worker = await getActiveWorker()
        return await postWithTimeout<T>(worker, message)
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e))
      }
    }

    throw lastError
  })

  queue = task.catch(() => {})
  return task
}
