import { exchangeCodeForToken } from '@/composables/useAuth/exchange-token'
import { loadAndClearVerifier } from '@/composables/useAuth/pkce-storage'
import type { User } from '@/types/user'
import { handleToken } from './handle-token'

/**
 * Run the PKCE exchange + downstream handleToken. Split out so
 * handleCode stays a tiny dispatcher and the per-function line limit
 * doesn't trip.
 * @param code - GitHub auth code
 * @param verifier - PKCE verifier loaded from the opener's storage
 * @param onSuccess - Callback with complete User
 * @param onError - Optional error callback
 * @returns Promise that resolves once handleToken finishes
 */
const runExchange = async (
  code: string,
  verifier: string,
  onSuccess: (user: User) => void,
  onError: ((error: string) => void) | undefined
): Promise<void> => {
  try {
    const token = await exchangeCodeForToken(code, verifier)
    await handleToken(token, onSuccess, onError)
  } catch (e) {
    onError?.(e instanceof Error ? e.message : 'Token exchange failed')
  }
}

/**
 * Exchange the GitHub auth code on the opener side. Used when the
 * popup ran on a different origin than the opener — the PKCE verifier
 * lives in the opener's localStorage, so only the opener can complete
 * PKCE.
 * @param code - GitHub auth code forwarded by the cross-origin popup
 * @param onSuccess - Callback with complete User
 * @param onError - Optional error callback
 * @returns Promise that resolves once exchange + handleToken finish
 */
export const handleCode = async (
  code: string,
  onSuccess: (user: User) => void,
  onError: ((error: string) => void) | undefined
): Promise<void> => {
  const verifier = loadAndClearVerifier()
  return verifier === undefined
    ? onError?.('Missing PKCE verifier on opener — start login again')
    : runExchange(code, verifier, onSuccess, onError)
}
