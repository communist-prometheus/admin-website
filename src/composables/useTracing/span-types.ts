/** Outcome status carried on a finished span. */
export type SpanStatus = 'ok' | 'error' | 'unset'

/**
 * Single recorded span. Trace-id is shared across all spans in a
 * trace; parentId points at the enclosing span (undefined for the
 * root span). Attributes are an arbitrary string→string map so
 * the exporter (Epic 7) can ship them as OTLP attributes.
 */
export type Span = {
  readonly id: string
  readonly traceId: string
  readonly parentId: string | undefined
  readonly name: string
  readonly startedAt: number
  readonly finishedAt: number | undefined
  readonly attributes: Readonly<Record<string, string>>
  readonly status: SpanStatus
}
