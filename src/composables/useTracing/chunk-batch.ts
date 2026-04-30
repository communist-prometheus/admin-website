import { emptyFold, finalize, stepFold } from './chunk-fold'
import { groupByTrace } from './chunk-group'
import type { Span } from './span-types'

/** Default chunk budget — must stay below the collector's 256 KB cap. */
export const DEFAULT_CHUNK_BYTES = 200 * 1024

const splitGroup = (
  group: ReadonlyArray<Span>,
  budget: number
): ReadonlyArray<ReadonlyArray<Span>> =>
  finalize(
    group.reduce((acc, span) => stepFold(acc, [span], budget), emptyFold)
  )

const mergeGroupChunks = (
  groupChunks: ReadonlyArray<ReadonlyArray<ReadonlyArray<Span>>>,
  budget: number
): ReadonlyArray<ReadonlyArray<Span>> =>
  finalize(
    groupChunks
      .flat()
      .reduce((acc, piece) => stepFold(acc, piece, budget), emptyFold)
  )

/**
 * Split a span batch into chunks that each stay under `budget`
 * bytes when serialised. Groups by trace-id first; if one trace
 * exceeds the budget alone, it is split internally rather than
 * emitted oversized.
 * @param spans Spans to chunk.
 * @param budget Per-chunk byte budget (default 200 KB).
 * @returns Frozen array of chunks; never empty when input is non-empty.
 */
export const chunkSpans = (
  spans: ReadonlyArray<Span>,
  budget: number = DEFAULT_CHUNK_BYTES
): ReadonlyArray<ReadonlyArray<Span>> => {
  const groupChunks = groupByTrace(spans).map(g => splitGroup(g, budget))
  return spans.length === 0 ? [] : mergeGroupChunks(groupChunks, budget)
}
