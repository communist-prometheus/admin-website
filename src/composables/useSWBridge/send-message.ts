import type { SWRequest } from '@/sw/protocol'

/**
 * Send a message to the active Service Worker and wait for a reply.
 * Uses a MessageChannel for request/response communication.
 * @param message - The message to send
 * @returns Promise resolving to the SW's response
 */
export const sendSWMessage = <T>(message: SWRequest): Promise<T> =>
  new Promise((resolve, reject) => {
    const sw = navigator.serviceWorker?.controller
    if (!sw) {
      reject(new Error('No active Service Worker'))
      return
    }

    const channel = new MessageChannel()
    channel.port1.onmessage = event => {
      resolve(event.data as T)
    }
    sw.postMessage(message, [channel.port2])
  })
