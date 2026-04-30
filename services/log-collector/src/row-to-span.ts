import type { SpanRecord } from './otlp-types'
import { parseAttrs } from './parse-attrs'

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number'

const isSpanStatus = (v: unknown): v is SpanRecord['status'] =>
  v === 'ok' || v === 'error' || v === 'unset'

const buildSpan = (
  row: Record<string, unknown>,
  status: SpanRecord['status']
): SpanRecord => ({
  traceId: isString(row['trace_id']) ? row['trace_id'] : '',
  spanId: isString(row['span_id']) ? row['span_id'] : '',
  parentSpanId: isString(row['parent_span_id'])
    ? row['parent_span_id']
    : undefined,
  name: isString(row['name']) ? row['name'] : '',
  startedAt: isNumber(row['started_at']) ? row['started_at'] : 0,
  finishedAt: isNumber(row['finished_at']) ? row['finished_at'] : 0,
  status,
  attributes: parseAttrs(row['attrs']),
})

/**
 * Convert a raw D1 `spans` row into a SpanRecord. Returns
 * undefined for rows missing required columns.
 * @param row Raw D1 row.
 * @returns SpanRecord or undefined.
 */
export const rowToSpan = (row: unknown): SpanRecord | undefined => {
  const ok =
    isObject(row) &&
    isString(row['trace_id']) &&
    isString(row['span_id']) &&
    isString(row['name']) &&
    isNumber(row['started_at']) &&
    isNumber(row['finished_at']) &&
    isSpanStatus(row['status'])
  return ok ? buildSpan(row, row['status']) : undefined
}
