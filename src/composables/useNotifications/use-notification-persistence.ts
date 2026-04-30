import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import {
  type NotificationEntry,
  useNotificationsStore,
} from '@/stores/notifications'
import { useNotificationsHistoryStore } from '@/stores/notifications-history'

/**
 * Strip non-cloneable fields (CTA actions are functions and IDB
 * structured-clone rejects functions) before persisting. The CTA
 * is dropped entirely — history entries are read-only records.
 * @param entry Source queue entry.
 * @returns IDB-safe history entry.
 */
const toPersistable = (entry: NotificationEntry): NotificationEntry => {
  const { cta: _cta, ...rest } = entry
  return rest
}

/**
 * Wire the transient notifications queue to the persistent history
 * store: hydrate from IDB on mount, append every new entry as it
 * is added to the queue. Call once at app boot — typically inside
 * a setup-only component such as `App.vue`.
 * @returns void
 */
export const useNotificationsPersistence = (): void => {
  const queue = useNotificationsStore()
  const history = useNotificationsHistoryStore()
  const { entries } = storeToRefs(queue)
  void history.hydrate()
  watch(
    entries,
    (next, prev) => {
      const seen = new Set((prev ?? []).map(entry => entry.id))
      next
        .filter(entry => !seen.has(entry.id))
        .forEach(entry => {
          void history.appendEntry(toPersistable(entry))
        })
    },
    { flush: 'post' }
  )
}
