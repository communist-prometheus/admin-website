import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user'
import { saveToken } from '@/composables/useAuth/token-storage'
import type { User } from '@/types/user'
import { decodeOrUndefined } from '@/validation/decode'
import { OAuthMessageSchema } from '@/validation/schemas/oauth-message'

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
    if (event.origin !== globalThis.location.origin) return
    const msg = decodeOrUndefined(OAuthMessageSchema)(event.data)
    if (!msg) return
    if (msg.type === 'github-oauth-success') {
      handleToken(msg.token, onSuccess, onError).finally(cleanup)
    } else {
      onError?.(msg.error ?? 'Authentication failed')
      cleanup()
    }
  }
