import type { Ref } from 'vue'
import { listAll } from './notifications-history-idb'
import {
  append,
  clearAll as dbClearAll,
  markAllRead as dbMarkAllRead,
  removeOne,
} from './notifications-history-idb-write'
import type { HistoryEntry } from './notifications-history-types'

/**
 * Build the async history actions bound to the supplied entries
 * ref. Each action writes through to IDB and refreshes the ref.
 * @param items Reactive entries ref backing the store.
 * @returns Object exposing `refresh`, `appendEntry`, `markAllRead`,
 *          `removeEntry`, and `clear` actions.
 */
export const createHistoryActions = (items: Ref<readonly HistoryEntry[]>) => {
  const refresh = async (): Promise<void> => {
    items.value = await listAll()
  }
  return {
    refresh,
    appendEntry: async (entry: HistoryEntry): Promise<void> => {
      await append(entry)
      await refresh()
    },
    markAllRead: async (): Promise<void> => {
      await dbMarkAllRead()
      await refresh()
    },
    removeEntry: async (id: string): Promise<void> => {
      await removeOne(id)
      await refresh()
    },
    clear: async (): Promise<void> => {
      await dbClearAll()
      await refresh()
    },
  }
}
