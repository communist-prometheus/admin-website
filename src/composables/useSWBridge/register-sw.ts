import { log as swLog } from './sw-log'

const isDev = import.meta.env.DEV

/**
 * Resolve the Service Worker URL based on environment.
 * Dev: Vite serves the TS source directly.
 * Prod: pre-built sw.js in dist.
 * @returns SW script URL
 */
const getSWUrl = (): string => (isDev ? '/src/sw/main.ts' : '/sw.js')

/**
 * Check if ServiceWorker API is available.
 * @returns True if SW can be registered
 */
const isSWAvailable = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return 'serviceWorker' in navigator
}

/**
 * Register the Service Worker and wait for activation.
 * No-op during SSR or when SW is not supported.
 * @returns The ServiceWorkerRegistration, or undefined
 */
export const registerServiceWorker = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  if (!isSWAvailable()) {
    swLog('warn', 'ServiceWorker not supported')
    return undefined
  }

  try {
    const url = getSWUrl()
    const reg = await navigator.serviceWorker.register(
      url,
      isDev ? { type: 'module' } : {}
    )
    swLog('info', 'SW registered', { scope: reg.scope, url })
    listenForUpdates(reg)
    await navigator.serviceWorker.ready
    return reg
  } catch (e) {
    swLog('error', 'SW registration failed', { error: e })
    return undefined
  }
}

/**
 * Listen for SW update events and log them.
 * @param reg - The SW registration
 */
const listenForUpdates = (reg: ServiceWorkerRegistration): void => {
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing
    if (!newWorker) return

    swLog('info', 'SW update found')
    newWorker.addEventListener('statechange', () => {
      swLog('info', `SW state: ${newWorker.state}`)
    })
  })
}
