import type { LogRecord } from './otlp-types'
import { parseAttrs } from './parse-attrs'

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number'

const isLogLevel = (v: unknown): v is LogRecord['level'] =>
  v === 'debug' || v === 'info' || v === 'warn' || v === 'error'

const buildLog = (
  row: Record<string, unknown>,
  level: LogRecord['level']
): LogRecord => ({
  traceId: isString(row['trace_id']) ? row['trace_id'] : undefined,
  spanId: isString(row['span_id']) ? row['span_id'] : undefined,
  level,
  message: isString(row['message']) ? row['message'] : '',
  at: isNumber(row['at']) ? row['at'] : 0,
  attributes: parseAttrs(row['attrs']),
})

/**
 * Convert a raw D1 `logs` row into a LogRecord. Returns
 * undefined for rows missing required columns.
 * @param row Raw D1 row.
 * @returns LogRecord or undefined.
 */
export const rowToLog = (row: unknown): LogRecord | undefined => {
  const ok =
    isObject(row) &&
    isLogLevel(row['level']) &&
    isString(row['message']) &&
    isNumber(row['at'])
  return ok ? buildLog(row, row['level']) : undefined
}
