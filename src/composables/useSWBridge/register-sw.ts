import { log as swLog } from './sw-log'

/**
 * Check if ServiceWorker API is available.
 * @returns True if SW can be registered
 */
const isSWAvailable = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return 'serviceWorker' in navigator
}

/**
 * Check if sw.js exists before attempting registration.
 * Avoids noisy errors in dev mode where SW is not built.
 * @returns True if sw.js responds with a JS content type
 */
const swScriptExists = async (): Promise<boolean> => {
  try {
    const res = await fetch('/sw.js', { method: 'HEAD' })
    const ct = res.headers.get('content-type') ?? ''
    return ct.includes('javascript')
  } catch {
    return false
  }
}

/**
 * Register the Service Worker.
 * Skips registration in dev when sw.js is not built.
 * @returns The ServiceWorkerRegistration, or undefined
 */
export const registerServiceWorker = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  if (!isSWAvailable()) {
    swLog('warn', 'ServiceWorker not supported')
    return undefined
  }

  if (!(await swScriptExists())) {
    swLog('warn', 'sw.js not found, skipping registration')
    return undefined
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    swLog('info', 'SW registered', { scope: reg.scope })
    return reg
  } catch (e) {
    swLog('error', 'SW registration failed', { error: e })
    return undefined
  }
}
