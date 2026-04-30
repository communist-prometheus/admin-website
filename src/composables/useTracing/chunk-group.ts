import type { Span } from './span-types'

/**
 * Group spans by trace-id to keep all spans of a trace in the
 * same chunk. Returned order is insertion order — the first
 * trace seen comes first.
 * @param spans Spans to group.
 * @returns Array of per-trace span arrays.
 */
export const groupByTrace = (
  spans: ReadonlyArray<Span>
): ReadonlyArray<ReadonlyArray<Span>> => {
  const groups = new Map<string, Span[]>()
  for (const span of spans) {
    const list = groups.get(span.traceId) ?? []
    list.push(span)
    groups.set(span.traceId, list)
  }
  return [...groups.values()]
}
