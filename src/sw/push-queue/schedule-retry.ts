import { backoffMs } from './retry-policy'

/**
 * Schedule a deferred drain attempt. Returns immediately so the
 * caller does not block the SW message dispatch loop. Real
 * delivery is best-effort — if the SW is suspended before the
 * timer fires, the next user activity wakes it and the queue is
 * picked up on the next drain trigger.
 * @param attempt 1-indexed attempt count just completed.
 * @returns Cancel handle; call to cancel the scheduled drain.
 */
export const scheduleRetry = (attempt: number): (() => void) => {
  const delay = backoffMs(attempt)
  const handle = globalThis.setTimeout(() => {
    void runDrain()
  }, delay)
  return (): void => {
    globalThis.clearTimeout(handle)
  }
}

const runDrain = async (): Promise<void> => {
  const { drainPushes } = await import('./drain')
  await drainPushes()
}
