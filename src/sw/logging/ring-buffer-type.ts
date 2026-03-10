/**
 * Fixed-size ring buffer interface.
 * Overwrites oldest entries when full.
 */
export interface RingBuffer<T> {
  /** Push a new entry, evicting the oldest if full */
  readonly push: (item: T) => void
  /** Get all entries in insertion order */
  readonly entries: () => readonly T[]
  /** Current number of entries */
  readonly size: () => number
  /** Clear all entries */
  readonly clear: () => void
}
