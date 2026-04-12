import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user'
import { saveToken } from '@/composables/useAuth/token-storage'
import type { User } from '@/types/user'
import { decodeOrUndefined } from '@/validation/decode'
import { OAuthMessageSchema } from '@/validation/schemas/oauth-message'

/**
 * Origins allowed to deliver OAuth success messages to the admin.
 *
 * When the OAuth popup's redirect_uri points to one of these hostnames,
 * the callback page runs there (cross-origin from the opener) and uses
 * `postMessage(..., '*')` to deliver the token. We gate trust on the
 * receiving side: any message whose `event.origin` is NOT in this list
 * is silently dropped.
 *
 * The opener's own origin is always trusted (same-origin popup case).
 */
const TRUSTED_ORIGINS: readonly string[] = [
  'https://admin.comprom.org',
  'https://admin-website.igor-ganov.workers.dev',
  'http://localhost:5173',
  'http://localhost:4173',
]

const isTrustedOrigin = (origin: string): boolean =>
  typeof globalThis.location !== 'undefined' &&
  (origin === globalThis.location.origin || TRUSTED_ORIGINS.includes(origin))

/**
 * Handle received token: save and fetch user profile.
 * @param token - GitHub access token from callback
 * @param onSuccess - Callback with complete User
 * @param onError - Optional error callback
 */
const handleToken = async (
  token: string,
  onSuccess: (user: User) => void,
  onError: ((error: string) => void) | undefined
): Promise<void> => {
  try {
    saveToken(token)
    const user = await fetchGitHubUser(token)
    onSuccess(user)
  } catch {
    onError?.('Failed to fetch user after token exchange')
  }
}

/**
 * Creates message event handler for OAuth popup.
 * @param onSuccess - Callback on successful authentication
 * @param onError - Optional callback on authentication error
 * @param cleanup - Cleanup function for listeners and popup
 * @returns Message event handler function
 */
export const createMessageHandler =
  (
    onSuccess: (user: User) => void,
    onError: ((error: string) => void) | undefined,
    cleanup: () => void
  ) =>
  (event: MessageEvent) => {
    if (typeof globalThis.location === 'undefined') return
    if (!isTrustedOrigin(event.origin)) return
    const msg = decodeOrUndefined(OAuthMessageSchema)(event.data)
    if (!msg) return
    if (msg.type === 'github-oauth-success') {
      handleToken(msg.token, onSuccess, onError).finally(cleanup)
    } else {
      onError?.(msg.error ?? 'Authentication failed')
      cleanup()
    }
  }
