import { stringMap } from './otlp-string-map'
import type { LogLevel, LogRecord } from './otlp-types'

const LEVELS: ReadonlySet<LogLevel> = new Set([
  'debug',
  'info',
  'warn',
  'error',
])

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

/**
 * Validate a single OTLP log entry. Returns `undefined` for
 * malformed input.
 * @param raw Raw entry from a `/v1/logs` batch.
 * @returns Validated `LogRecord` or undefined.
 */
export const validLog = (raw: unknown): LogRecord | undefined => {
  const v = isObject(raw) ? raw : undefined
  const level = v?.['level']
  const ok =
    typeof v?.['message'] === 'string' &&
    typeof v['at'] === 'number' &&
    typeof level === 'string' &&
    LEVELS.has(level as LogLevel)
  return ok && v !== undefined
    ? {
        traceId: typeof v['traceId'] === 'string' ? v['traceId'] : undefined,
        spanId: typeof v['spanId'] === 'string' ? v['spanId'] : undefined,
        level: level as LogLevel,
        message: v['message'] as string,
        at: v['at'] as number,
        attributes: stringMap(v['attributes']),
      }
    : undefined
}
