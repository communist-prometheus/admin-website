import { MAX_AGE_MS, MAX_ENTRIES } from './config'
import type { ActionEntry } from './types'

interface PruneArgs {
  readonly entries: readonly ActionEntry[]
  readonly nowMs: number
  readonly maxEntries?: number
  readonly maxAgeMs?: number
}

/**
 * Prune an action-history list to fit the bounded ring buffer.
 *
 * The buffer is bounded by **both** count and age (whichever is
 * stricter). Entries are kept oldest-first; the head of the array
 * is the oldest entry, the tail the newest. This shape is what the
 * recorder's `append` writes back, and what the serialiser dumps.
 *
 * @param args - Current entries + clock + optional bounds override
 * @returns Pruned array oldest-first (no mutation of the input)
 */
export const pruneEntries = (args: PruneArgs): readonly ActionEntry[] => {
  const maxN = args.maxEntries ?? MAX_ENTRIES
  const maxAge = args.maxAgeMs ?? MAX_AGE_MS
  const cutoff = args.nowMs - maxAge
  const fresh = args.entries.filter(e => e.ts >= cutoff)
  const overflow = fresh.length - maxN
  return overflow > 0 ? fresh.slice(overflow) : fresh
}
