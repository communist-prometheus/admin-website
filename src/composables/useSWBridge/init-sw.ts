import type { SWGitConfig } from '@/sw/protocol'
import { buildSWConfig } from './build-sw-config'
import { initViaMessage } from './init-via-message'
import { log } from './sw-log'
import { markSWReady } from './sw-ready'

/**
 * Try fetch init (fast path, needs controller).
 * @param config - Git config to send
 * @returns True if SW confirmed init via fetch
 */
const tryFetchInit = async (config: SWGitConfig): Promise<boolean> => {
  try {
    const res = await fetch('/api/sw/init', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(config),
    })
    const d: { ok: boolean } = await res.json()
    return d.ok
  } catch {
    return false
  }
}

/**
 * Send git config to the SW.
 * Prefers fetch (intercepted by SW), falls back to
 * MessageChannel when fetch fails (WebKit activation race).
 * @param token - GitHub access token
 */
export const initSWWithToken = async (token: string): Promise<void> => {
  if (typeof globalThis.document === 'undefined') {
    markSWReady()
    return
  }
  try {
    const config = buildSWConfig(token)
    const hasCtr = !!navigator.serviceWorker.controller
    const ok = hasCtr && (await tryFetchInit(config))
    if (!ok) await initViaMessage(config)
  } catch (e) {
    log('error', 'SW init failed', {
      error: e instanceof Error ? e.message : String(e),
    })
  } finally {
    markSWReady()
  }
}
