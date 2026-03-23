import type { SWAuthor } from './build-sw-config'
import { buildSWConfig } from './build-sw-config'
import { initViaMessage } from './init-via-message'
import { log } from './sw-log'
import { markSWReady } from './sw-ready'
import { tryFetchInit } from './try-fetch-init'

const RETRIES = 5
const DELAY = 2_000

/**
 * Delay execution for a given number of milliseconds.
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after ms
 */
const wait = (ms: number): Promise<void> =>
  new Promise(r => globalThis.setTimeout(r, ms))

/**
 * Send git config to the SW with retry.
 * Marks ready only on success or after all retries exhaust.
 * @param token - GitHub access token
 * @param author - Optional git commit author info
 */
export const initSWWithToken = async (
  token: string,
  author?: SWAuthor
): Promise<void> => {
  if (typeof globalThis.document === 'undefined') {
    markSWReady()
    return
  }
  const config = buildSWConfig(token, author)
  for (let i = 0; i < RETRIES; i++) {
    try {
      const hasCtr = !!navigator.serviceWorker.controller
      const ok = hasCtr && (await tryFetchInit(config))
      if (!ok) await initViaMessage(config)
      markSWReady()
      return
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      log('warn', `SW init ${i + 1}/${RETRIES}: ${msg}`)
      if (i < RETRIES - 1) await wait(DELAY)
    }
  }
  log('error', 'SW init exhausted retries')
  markSWReady()
}
