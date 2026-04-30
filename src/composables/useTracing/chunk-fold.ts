import type { Span } from './span-types'

/** Accumulator state for the chunking fold. */
export type FoldState = {
  readonly chunks: ReadonlyArray<ReadonlyArray<Span>>
  readonly current: ReadonlyArray<Span>
}

const sizeOf = (spans: ReadonlyArray<Span>): number =>
  JSON.stringify({ spans }).length

/**
 * Fold step: append `next` to the current bucket if it still
 * fits inside `budget`; otherwise close the bucket and start a
 * fresh one with `next`.
 * @param state Current fold accumulator.
 * @param next Spans to append (single span or chunk piece).
 * @param budget Per-chunk byte budget.
 * @returns Next fold state.
 */
export const stepFold = (
  state: FoldState,
  next: ReadonlyArray<Span>,
  budget: number
): FoldState => {
  const combined = [...state.current, ...next]
  const fits = state.current.length === 0 || sizeOf(combined) <= budget
  return fits
    ? { chunks: state.chunks, current: combined }
    : {
        chunks: [...state.chunks, state.current],
        current: [...next],
      }
}

/**
 * Convert a fold state into the final chunk list, including
 * any non-empty trailing bucket.
 * @param state Final fold state.
 * @returns Flat list of chunks.
 */
export const finalize = (
  state: FoldState
): ReadonlyArray<ReadonlyArray<Span>> =>
  state.current.length === 0 ? state.chunks : [...state.chunks, state.current]

/** Empty initial fold state. */
export const emptyFold: FoldState = { chunks: [], current: [] }
