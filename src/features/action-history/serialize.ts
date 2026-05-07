import type { ActionEntry } from './types'

interface SerializedHistory {
  readonly schema: 'admin-action-history/v1'
  readonly capturedAt: string
  readonly entryCount: number
  readonly entries: readonly ActionEntry[]
}

/**
 * Serialise the action history into the stable JSON shape that
 * lands in the ticket as `actions-history.json`.
 *
 * The shape is versioned via `schema` so triage tooling can fail
 * loudly if we ever change the layout.
 *
 * @param entries - Pruned history, oldest-first
 * @param nowMs - Wall-clock timestamp of the snapshot
 * @returns Serialised payload
 */
export const serializeHistory = (
  entries: readonly ActionEntry[],
  nowMs: number
): SerializedHistory => ({
  schema: 'admin-action-history/v1',
  capturedAt: new Date(nowMs).toISOString(),
  entryCount: entries.length,
  entries,
})

/**
 * Render the snapshot as a JSON string with stable indentation.
 *
 * @param entries - Pruned history, oldest-first
 * @param nowMs - Wall-clock timestamp of the snapshot
 * @returns Pretty-printed JSON string
 */
export const renderHistoryJson = (
  entries: readonly ActionEntry[],
  nowMs: number
): string => `${JSON.stringify(serializeHistory(entries, nowMs), null, 2)}\n`
