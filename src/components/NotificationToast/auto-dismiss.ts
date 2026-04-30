import type { NotificationKind } from '@/stores/notifications'
import { isStickyKind } from './is-sticky-kind'

/** Auto-dismiss delay (ms) for transient toasts. */
export const AUTO_DISMISS_MS = 5_000

/**
 * Schedule an auto-dismiss for a transient notification. Sticky
 * kinds (error/conflict/network) skip arming the timer entirely so
 * the toast persists until the user dismisses it. The returned
 * cleanup is safe to call regardless of kind.
 * @param kind Notification kind that determines stickiness.
 * @param dismiss Callback fired once the timer elapses.
 * @returns Cleanup function the caller invokes on unmount.
 */
export const scheduleAutoDismiss = (
  kind: NotificationKind,
  dismiss: () => void
): (() => void) => {
  const handle = isStickyKind(kind)
    ? undefined
    : globalThis.setTimeout(dismiss, AUTO_DISMISS_MS)
  return (): void => {
    globalThis.clearTimeout(handle)
  }
}
