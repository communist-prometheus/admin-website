import { log as swLog } from './sw-log'

const isDev = import.meta.env.DEV

/**
 * Resolve the Service Worker URL based on environment.
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
 * Register the Service Worker.
 * In production, the SW is pre-registered from the HTML template
 * for a head start. This call returns the existing registration.
 * Does NOT wait for activation — content loading gates on swReady.
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
    swLog('info', 'SW registered', { scope: reg.scope })
    return reg
  } catch (e) {
    swLog('error', 'SW registration failed', { error: e })
    return undefined
  }
}
