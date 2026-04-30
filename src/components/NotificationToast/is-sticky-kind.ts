import type { NotificationKind } from '@/stores/notifications'

const STICKY: ReadonlySet<NotificationKind> = new Set([
  'error',
  'conflict',
  'network',
])

/**
 * A notification kind is "sticky" when the toast must stay on screen
 * until the user dismisses it explicitly. Informational kinds are
 * transient, so they auto-dismiss; failure-class kinds are sticky so
 * the user does not lose actionable information.
 * @param kind Notification kind to classify.
 * @returns True when the kind requires explicit dismissal.
 */
export const isStickyKind = (kind: NotificationKind): boolean =>
  STICKY.has(kind)
