import type { SWGitConfig } from '@/sw/protocol'
import { setSwNonce } from './sw-nonce'

/**
 * Record a successful init's nonce and report success.
 * @param nonce - The capability nonce from the init reply
 * @returns Always true (the init succeeded)
 */
const storeNonce = (nonce: string | undefined): true => {
  setSwNonce(nonce)
  return true
}

/**
 * Try fetch-based init (fast path, needs controller).
 * @param config - Git config to send
 * @returns True if SW confirmed init via fetch
 */
export const tryFetchInit = async (config: SWGitConfig): Promise<boolean> => {
  try {
    const res = await fetch('/api/sw/init', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(config),
    })
    const d: { ok: boolean; nonce?: string } = await res.json()
    return d.ok ? storeNonce(d.nonce) : false
  } catch {
    return false
  }
}
