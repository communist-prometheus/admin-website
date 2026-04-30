import type { SearchQuery } from './search-query'
import {
  isTraceRow,
  type SearchResponse,
  type TraceRow,
  type TraceSummary,
} from './search-row-types'
import { buildWhere } from './search-sql'
import { SEARCH_TRACES_SQL } from './search-traces-sql'
import type { StorageBindings } from './storage-types'

const toSummary = (row: TraceRow): TraceSummary => ({
  traceId: row.trace_id,
  rootSpanId: row.root_span_id,
  rootName: row.root_name,
  status: row.root_status,
  startedAt: row.started_at,
  spanCount: row.span_count,
  durationMs: row.duration_ms,
})

const cursorOf = (
  rows: ReadonlyArray<TraceSummary>,
  limit: number
): number | undefined =>
  rows.length < limit ? undefined : rows[rows.length - 1]?.startedAt

const emptyResponse: SearchResponse = { traces: [], nextCursor: undefined }

/**
 * Run a trace search against D1. Returns an empty response when
 * the binding is absent (local dev / unit tests without D1).
 * @param bindings Worker storage bindings.
 * @param query Parsed query parameters.
 * @returns Search response.
 */
export const searchTraces = async (
  bindings: StorageBindings,
  query: SearchQuery
): Promise<SearchResponse> => {
  const db = bindings.D1
  const where = buildWhere(query)
  const sql = SEARCH_TRACES_SQL.replace('__WHERE__', where.sql)
  const result = await db
    ?.prepare(sql)
    .bind(...where.bind, query.limit)
    .all()
  const rows = (result?.results ?? []).filter(isTraceRow)
  const traces = rows.map(toSummary)
  return db === undefined
    ? emptyResponse
    : { traces, nextCursor: cursorOf(traces, query.limit) }
}
