import { defineStore } from 'pinia'
import { createNotificationsState } from './notifications-state'

export type {
  NotificationCta,
  NotificationEntry,
  NotificationInput,
  NotificationKind,
} from './notifications-types'

/** Pinia store backing the in-memory notifications queue. */
export const useNotificationsStore = defineStore('notifications', () =>
  createNotificationsState()
)
