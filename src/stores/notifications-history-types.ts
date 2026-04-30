import type { NotificationEntry } from './notifications-types'

/** Persisted history entry — same shape as a queue entry plus a
 * read timestamp that turns "unread" into "read" in the drawer. */
export type HistoryEntry = NotificationEntry & {
  readonly readAt?: number
}
