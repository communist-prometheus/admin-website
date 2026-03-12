const ACTIVATION_TIMEOUT = 10_000

/**
 * Get the active Service Worker.
 * Avoids navigator.serviceWorker.ready which can hang
 * indefinitely when the SW is stuck in 'installing'.
 * Instead watches the registration's statechange events.
 * @returns Active ServiceWorker instance
 */
export const getActiveWorker = async (): Promise<ServiceWorker> => {
  const sw = navigator.serviceWorker
  if (!sw) throw new Error('ServiceWorker not supported')

  if (sw.controller) return sw.controller

  const regs = await sw.getRegistrations()
  const reg = regs[0]
  if (!reg) throw new Error('No SW registration')

  if (reg.active) return reg.active

  const worker = reg.installing ?? reg.waiting
  if (!worker) throw new Error('No SW worker found')

  return new Promise<ServiceWorker>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      reject(new Error('SW activation timeout'))
    }, ACTIVATION_TIMEOUT)

    const check = (): void => {
      if (worker.state === 'activated') {
        globalThis.clearTimeout(timer)
        resolve(worker)
      }
    }

    worker.addEventListener('statechange', check)
    check()
  })
}
