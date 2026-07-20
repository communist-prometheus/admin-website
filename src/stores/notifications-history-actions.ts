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
 *
 * Every mutation runs through a single serial chain. Without it,
 * concurrent writes — the bridge fires one `appendEntry` per rapid
 * notification — interleave: a `refresh` (full `listAll`) issued
 * between two IDB commits reads a stale snapshot and overwrites
 * `items`, silently dropping the other entry. Serializing write+refresh
 * makes each refresh observe every commit that preceded it, so the ref
 * can never regress. A rejected op does not stall the chain.
 * @param items Reactive entries ref backing the store.
 * @returns Object exposing `refresh`, `appendEntry`, `markAllRead`,
 *          `removeEntry`, and `clear` actions.
 */
export const createHistoryActions = (items: Ref<readonly HistoryEntry[]>) => {
  const refresh = async (): Promise<void> => {
    items.value = await listAll()
  }
  let chain: Promise<void> = Promise.resolve()
  const serial = (op: () => Promise<void>): Promise<void> => {
    chain = chain.then(op, op)
    return chain
  }
  return {
    refresh,
    appendEntry: (entry: HistoryEntry): Promise<void> =>
      serial(async () => {
        await append(entry)
        await refresh()
      }),
    markAllRead: (): Promise<void> =>
      serial(async () => {
        await dbMarkAllRead()
        await refresh()
      }),
    removeEntry: (id: string): Promise<void> =>
      serial(async () => {
        await removeOne(id)
        await refresh()
      }),
    clear: (): Promise<void> =>
      serial(async () => {
        await dbClearAll()
        await refresh()
      }),
  }
}
