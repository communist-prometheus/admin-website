import { clearEntries, deleteEntries, listEntries, putEntry } from './db'
import { stampEntry } from './redact'
import { pruneEntries } from './ring-buffer'
import type { ActionEntry, RecordableEntry } from './types'

const newId = (): string => globalThis.crypto.randomUUID()

const evict = async (): Promise<void> => {
  const all = await listEntries()
  const kept = pruneEntries({ entries: all, nowMs: Date.now() })
  const keptIds = new Set(kept.map(e => e.id))
  const removed = all.filter(e => !keptIds.has(e.id)).map(e => e.id)
  await (removed.length > 0 ? deleteEntries(removed) : Promise.resolve())
}

/**
 * Record a single action.
 *
 * Persists the entry and trims the buffer to the configured caps.
 * Errors are swallowed — the recorder is a best-effort sidecar; we
 * don't want a failed IDB write to blow up the user's main flow.
 *
 * @param entry - Recordable shape (id + ts will be assigned)
 */
export const recordAction = async (entry: RecordableEntry): Promise<void> => {
  try {
    const stamped = stampEntry(entry, Date.now(), newId)
    await putEntry(stamped)
    await evict()
  } catch {
    /* best-effort recorder; never throw out to caller */
  }
}

/**
 * Read the current ring buffer, post-prune.
 * @returns Pruned array, oldest-first
 */
export const readHistory = async (): Promise<readonly ActionEntry[]> => {
  const all = await listEntries()
  return pruneEntries({ entries: all, nowMs: Date.now() })
}

/**
 * Wipe the entire ring buffer (Settings → Clear my action history).
 */
export const clearHistory = async (): Promise<void> => {
  await clearEntries()
}
