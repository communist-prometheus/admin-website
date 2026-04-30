import { defineStore } from 'pinia'
import { createNotificationsHistoryState } from './notifications-history-state'

export type { HistoryEntry } from './notifications-history-types'

/** Pinia store backing the persistent notifications history drawer. */
export const useNotificationsHistoryStore = defineStore(
  'notifications-history',
  () => createNotificationsHistoryState()
)
