import type { NotificationKind } from '@/stores/notifications'

/** Filter buttons rendered above the history list. */
export type DrawerFilter = NotificationKind | 'all'

/** Stable order of filter chips shown in the drawer toolbar. */
export const DRAWER_FILTERS: ReadonlyArray<DrawerFilter> = [
  'all',
  'info',
  'warn',
  'error',
  'conflict',
  'network',
]
