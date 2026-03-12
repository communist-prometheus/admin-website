/**
 * Get the active Service Worker, waiting if needed.
 * Uses navigator.serviceWorker.ready to ensure activation.
 * @returns Active ServiceWorker instance
 */
export const getActiveWorker = async (): Promise<ServiceWorker> => {
  const sw = navigator.serviceWorker
  if (!sw) throw new Error('ServiceWorker not supported')
  const reg = await sw.ready
  const worker = reg.active ?? sw.controller
  if (!worker) throw new Error('No active Service Worker')
  return worker
}
