import type { Span } from '@/composables/useTracing'

/** A trace plus the spans recorded under it. */
export type TraceGroup = {
  readonly traceId: string
  readonly spans: ReadonlyArray<Span>
  readonly startedAt: number
}

/**
 * Group recorded spans by trace-id and sort each group oldest-
 * first internally. The outer list is sorted newest-trace-first
 * so the most recent activity surfaces at the top of the overlay.
 * @param spans Recorded spans (any order).
 * @returns Frozen array of trace groups.
 */
export const groupByTrace = (
  spans: ReadonlyArray<Span>
): ReadonlyArray<TraceGroup> => {
  const map = new Map<string, Span[]>()
  for (const span of spans) {
    const list = map.get(span.traceId) ?? []
    list.push(span)
    map.set(span.traceId, list)
  }
  const groups = [...map.entries()].map(([traceId, spans]) => ({
    traceId,
    spans: spans.slice().sort((a, b) => a.startedAt - b.startedAt),
    startedAt: spans[0]?.startedAt ?? 0,
  }))
  return groups.sort((a, b) => b.startedAt - a.startedAt)
}
