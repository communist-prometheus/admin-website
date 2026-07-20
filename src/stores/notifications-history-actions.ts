import type { Ref } from 'vue'
import { listAll } from './notifications-history-idb'
import {
  append,
  clearAll as dbClearAll,
  markAllRead as dbMarkAllRead,
  removeOne,
} from './notifications-history-idb-write'
import type { HistoryEntry } from './notifications-history-types'

type Items = Ref<readonly HistoryEntry[]>

const byCreatedAt = (a: HistoryEntry, b: HistoryEntry): number =>
  a.createdAt - b.createdAt

/*
 * In-memory `items` is the source of truth; IDB is write-through.
 *
 * An earlier model rebuilt `items` from a full `listAll` after every
 * write. Under concurrency that dropped entries: the boot-time `hydrate`
 * refresh reads IDB once and, resolving AFTER the first live appends had
 * committed, overwrote `items` with its stale snapshot — the drawer went
 * empty though the notifications were there (proven by trace). Now every
 * mutation edits the ref directly and persists; nothing replaces the ref
 * with a bulk snapshot, so a slow read can neither clobber nor
 * head-of-line-block live writes. `refresh` (hydrate only) MERGES the
 * persisted set in without displacing live entries.
 */
const mergePersisted = async (items: Items): Promise<void> => {
  const loaded = await listAll()
  const have = new Set(items.value.map(entry => entry.id))
  items.value = [
    ...items.value,
    ...loaded.filter(entry => !have.has(entry.id)),
  ].sort(byCreatedAt)
}

const appendOne = async (
  items: Items,
  entry: HistoryEntry
): Promise<void> => {
  items.value = [...items.value, entry].sort(byCreatedAt)
  await append(entry)
}

const stampAllRead = async (items: Items): Promise<void> => {
  const readAt = Date.now()
  items.value = items.value.map(entry =>
    entry.readAt === undefined ? { ...entry, readAt } : entry
  )
  await dbMarkAllRead()
}

const dropOne = async (items: Items, id: string): Promise<void> => {
  items.value = items.value.filter(entry => entry.id !== id)
  await removeOne(id)
}

const dropAll = async (items: Items): Promise<void> => {
  items.value = []
  await dbClearAll()
}

/**
 * Build the history actions bound to the supplied entries ref. Each
 * mutation edits the ref directly and writes through to IDB; `refresh`
 * (used once at boot by `hydrate`) merges the persisted set in.
 * @param items Reactive entries ref backing the store.
 * @returns Object exposing `refresh`, `appendEntry`, `markAllRead`,
 *          `removeEntry`, and `clear` actions.
 */
export const createHistoryActions = (items: Items) => ({
  refresh: (): Promise<void> => mergePersisted(items),
  appendEntry: (entry: HistoryEntry): Promise<void> =>
    appendOne(items, entry),
  markAllRead: (): Promise<void> => stampAllRead(items),
  removeEntry: (id: string): Promise<void> => dropOne(items, id),
  clear: (): Promise<void> => dropAll(items),
})
