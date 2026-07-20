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
const byCreatedAt = (a: HistoryEntry, b: HistoryEntry): number =>
  a.createdAt - b.createdAt

export const createHistoryActions = (items: Ref<readonly HistoryEntry[]>) => {
  /*
   * In-memory `items` is the source of truth; IDB is write-through.
   *
   * The previous model rebuilt `items` from a full `listAll` after every
   * write. Under concurrency that dropped entries: the boot-time `hydrate`
   * refresh reads IDB once and, resolving AFTER the first live appends had
   * committed, overwrote `items` with its stale snapshot — the drawer went
   * empty though the notifications were there (proven by trace). Now every
   * mutation edits the ref directly and persists; nothing ever replaces
   * the ref with a bulk snapshot, so a slow read can neither clobber nor
   * head-of-line-block live writes. `refresh` (hydrate only) MERGES the
   * persisted set in without displacing live entries.
   */
  const refresh = async (): Promise<void> => {
    const loaded = await listAll()
    const have = new Set(items.value.map(entry => entry.id))
    items.value = [
      ...items.value,
      ...loaded.filter(entry => !have.has(entry.id)),
    ].sort(byCreatedAt)
  }
  return {
    refresh,
    appendEntry: async (entry: HistoryEntry): Promise<void> => {
      items.value = [...items.value, entry].sort(byCreatedAt)
      await append(entry)
    },
    markAllRead: async (): Promise<void> => {
      const readAt = Date.now()
      items.value = items.value.map(entry =>
        entry.readAt === undefined ? { ...entry, readAt } : entry
      )
      await dbMarkAllRead()
    },
    removeEntry: async (id: string): Promise<void> => {
      items.value = items.value.filter(entry => entry.id !== id)
      await removeOne(id)
    },
    clear: async (): Promise<void> => {
      items.value = []
      await dbClearAll()
    },
  }
}
