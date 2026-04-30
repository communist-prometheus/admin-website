import { validLog } from './otlp-log'
import { validSpan } from './otlp-span'
import type { LogRecord, SpanRecord } from './otlp-types'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const collect = <T>(
  raw: unknown,
  key: string,
  validate: (item: unknown) => T | undefined
): readonly T[] => {
  const arr = isObject(raw) ? raw[key] : undefined
  return Array.isArray(arr)
    ? arr.map(validate).filter((x): x is T => x !== undefined)
    : []
}

/**
 * Parse and validate a `/v1/traces` batch. Drops malformed spans
 * rather than rejecting the whole batch — exporter is fire-and-
 * forget so partial acceptance keeps healthy traces visible.
 * @param body Raw `request.json()` result.
 * @returns Frozen array of valid spans.
 */
export const parseTraceBatch = (body: unknown): readonly SpanRecord[] =>
  collect(body, 'spans', validSpan)

/**
 * Parse and validate a `/v1/logs` batch. Drops malformed entries.
 * @param body Raw `request.json()` result.
 * @returns Frozen array of valid log records.
 */
export const parseLogBatch = (body: unknown): readonly LogRecord[] =>
  collect(body, 'logs', validLog)
