import type { SWRequest } from '@/sw/protocol'

/**
 * Get the active Service Worker, waiting if needed.
 * @returns Active ServiceWorker instance
 */
const getActiveWorker = async (): Promise<ServiceWorker> => {
  const sw = navigator.serviceWorker
  if (!sw) throw new Error('ServiceWorker not supported')
  const reg = await sw.ready
  const worker = reg.active ?? sw.controller
  if (!worker) throw new Error('No active Service Worker')
  return worker
}

/**
 * Send a message to the active Service Worker and wait for a reply.
 * Uses a MessageChannel for request/response communication.
 * @param message - The message to send
 * @returns Promise resolving to the SW's response
 */
export const sendSWMessage = async <T>(message: SWRequest): Promise<T> => {
  const worker = await getActiveWorker()
  return new Promise(resolve => {
    const channel = new MessageChannel()
    channel.port1.onmessage = event => {
      resolve(event.data as T)
    }
    worker.postMessage(message, [channel.port2])
  })
}
