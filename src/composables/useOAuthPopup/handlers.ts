import { checkAuthStatus } from '@/composables/useAuth/check-auth'
import type { User } from '@/types/user'

/**
 * Fetch the full user (with accessToken) from the server session.
 * The OAuth postMessage only carries display fields; the token
 * lives exclusively in the HTTP-only session cookie.
 * @param onSuccess - Callback with complete User
 * @param onError - Optional error callback
 */
const fetchSessionUser = async (
  onSuccess: (user: User) => void,
  onError: ((error: string) => void) | undefined
): Promise<void> => {
  const { authenticated, user } = await checkAuthStatus()
  if (authenticated && user) onSuccess(user)
  else onError?.('Session missing after OAuth callback')
}

/**
 * Creates message event handler for OAuth popup communication.
 * @param onSuccess - Callback on successful authentication
 * @param onError - Optional callback on authentication error
 * @param cleanup - Cleanup function to remove listeners and close popup
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
    if (event.data.type === 'github-oauth-success') {
      fetchSessionUser(onSuccess, onError).finally(cleanup)
    } else if (event.data.type === 'github-oauth-error') {
      onError?.(event.data.error || 'Authentication failed')
      cleanup()
    }
  }

/**
 * Creates interval monitor to detect when popup window closes.
 * @param popup - Popup window instance to monitor
 * @param onClose - Callback when popup closes
 * @returns Interval ID for the monitor
 */
export const createPopupMonitor = (
  popup: Window | null,
  onClose: () => void
) => {
  const checkPopup = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkPopup)
      onClose()
    }
  }, 500)
  return checkPopup
}
