import type { SWGitConfig } from '@/sw/protocol'
import { setSwNonce } from './sw-nonce'

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
    if (d.ok) setSwNonce(d.nonce)
    return d.ok
  } catch {
    return false
  }
}
