import type { NotificationKind } from '@/stores/notifications'

/** Notification kinds offered as quick-fire dev triggers. */
export const DEV_TRIGGER_KINDS: ReadonlyArray<NotificationKind> = [
  'info',
  'warn',
  'error',
  'conflict',
  'network',
]
