import type { SWRequest } from '@/sw/protocol'
import { getActiveWorker } from './get-active-worker'
import { postWithTimeout } from './post-with-timeout'

/**
 * Send a single message to the SW via MessageChannel.
 * Used only for debug panel (SW_STATUS, SW_METRICS, SW_LOG_SUBSCRIBE).
 * No retries, no queue — if it fails, it fails.
 * @param message - The message to send
 * @returns Promise resolving to the SW's response
 */
export const sendSWMessage = async <T>(message: SWRequest): Promise<T> => {
  const worker = await getActiveWorker()
  return postWithTimeout<T>(worker, message)
}
