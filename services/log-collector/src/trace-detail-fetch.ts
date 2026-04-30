import type { LogRecord, SpanRecord } from './otlp-types'
import { rowToLog } from './row-to-log'
import { rowToSpan } from './row-to-span'
import type { StorageBindings } from './storage-types'

const SPANS_SQL =
  'SELECT trace_id, span_id, parent_span_id, name, started_at, ' +
  'finished_at, status, attrs FROM spans WHERE trace_id = ? ' +
  'ORDER BY started_at ASC'

const LOGS_SQL =
  'SELECT trace_id, span_id, level, message, at, attrs FROM logs ' +
  'WHERE trace_id = ? ORDER BY at ASC'

const fetchAll = async (
  db: NonNullable<StorageBindings['D1']>,
  sql: string,
  traceId: string
): Promise<ReadonlyArray<unknown>> => {
  const result = await db.prepare(sql).bind(traceId).all()
  return result.results
}

const isDefined = <T>(value: T | undefined): value is T => value !== undefined

/** Spans + logs for one trace, both ordered chronologically. */
export type TraceFetchResult = {
  readonly spans: ReadonlyArray<SpanRecord>
  readonly logs: ReadonlyArray<LogRecord>
}

const empty: TraceFetchResult = { spans: [], logs: [] }

/**
 * Pull every span + log carrying `traceId` from D1 in one round.
 * Returns the empty shape when D1 is absent so callers can
 * short-circuit in tests.
 * @param bindings Worker storage bindings.
 * @param traceId Trace identifier from the URL.
 * @returns Spans + logs, both chronologically ordered.
 */
export const fetchTraceDetail = async (
  bindings: StorageBindings,
  traceId: string
): Promise<TraceFetchResult> => {
  const db = bindings.D1
  if (db === undefined) return empty
  const [spanRows, logRows] = await Promise.all([
    fetchAll(db, SPANS_SQL, traceId),
    fetchAll(db, LOGS_SQL, traceId),
  ])
  return {
    spans: spanRows.map(rowToSpan).filter(isDefined),
    logs: logRows.map(rowToLog).filter(isDefined),
  }
}
