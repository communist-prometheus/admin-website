/** A row returned by the trace search aggregation query. */
export type TraceRow = {
  readonly trace_id: string
  readonly root_span_id: string
  readonly root_name: string
  readonly root_status: string
  readonly started_at: number
  readonly span_count: number
  readonly duration_ms: number
}

/** Shape returned to clients — camel-cased and well-typed. */
export type TraceSummary = {
  readonly traceId: string
  readonly rootSpanId: string
  readonly rootName: string
  readonly status: string
  readonly startedAt: number
  readonly spanCount: number
  readonly durationMs: number
}

/** Response body for `GET /v1/traces`. */
export type SearchResponse = {
  readonly traces: ReadonlyArray<TraceSummary>
  readonly nextCursor: number | undefined
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const isStringField = (row: Record<string, unknown>, key: string): boolean =>
  typeof row[key] === 'string'

const isNumberField = (row: Record<string, unknown>, key: string): boolean =>
  typeof row[key] === 'number'

/**
 * Type guard for the raw D1 row shape so callers can map without
 * casting. Rejects rows that are missing required columns.
 * @param row Raw row from a D1 result.
 * @returns True when the row matches `TraceRow`.
 */
export const isTraceRow = (row: unknown): row is TraceRow =>
  isObject(row) &&
  isStringField(row, 'trace_id') &&
  isStringField(row, 'root_span_id') &&
  isStringField(row, 'root_name') &&
  isStringField(row, 'root_status') &&
  isNumberField(row, 'started_at') &&
  isNumberField(row, 'span_count') &&
  isNumberField(row, 'duration_ms')
