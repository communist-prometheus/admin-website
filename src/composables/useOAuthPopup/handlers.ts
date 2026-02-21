import type { User } from '@/types/user'

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
    if (event.origin !== globalThis.location.origin) return
    if (event.data.type === 'github-oauth-success') {
      onSuccess(event.data.user)
      cleanup()
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
