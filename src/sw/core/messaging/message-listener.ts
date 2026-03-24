import { handleMessage } from './message-handler'

declare const self: ServiceWorkerGlobalScope

/**
 * Register the message event listener for client communication.
 */
export const registerMessageListener = (): void => {
  self.addEventListener('message', event => {
    const reply = (data: unknown) => event.ports[0]?.postMessage(data)
    handleMessage(event.data, reply)
  })
}
