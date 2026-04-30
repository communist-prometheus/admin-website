import { stringMap } from './otlp-string-map'
import type { SpanRecord, SpanStatus } from './otlp-types'

const STATUSES: ReadonlySet<SpanStatus> = new Set(['ok', 'error', 'unset'])

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const checkSpan = (raw: Record<string, unknown>): boolean => {
  const status = raw['status']
  return (
    typeof raw['traceId'] === 'string' &&
    typeof raw['spanId'] === 'string' &&
    typeof raw['name'] === 'string' &&
    typeof raw['startedAt'] === 'number' &&
    typeof raw['finishedAt'] === 'number' &&
    typeof status === 'string' &&
    STATUSES.has(status as SpanStatus)
  )
}

/**
 * Validate a single OTLP span entry. Returns `undefined` for
 * malformed input so the caller can `.filter` it out without a
 * cast.
 * @param raw Raw entry from a `/v1/traces` batch.
 * @returns Validated `SpanRecord` or undefined.
 */
export const validSpan = (raw: unknown): SpanRecord | undefined => {
  const v = isObject(raw) ? raw : undefined
  return v !== undefined && checkSpan(v)
    ? {
        traceId: v['traceId'] as string,
        spanId: v['spanId'] as string,
        parentSpanId:
          typeof v['parentSpanId'] === 'string'
            ? v['parentSpanId']
            : undefined,
        name: v['name'] as string,
        startedAt: v['startedAt'] as number,
        finishedAt: v['finishedAt'] as number,
        status: v['status'] as SpanStatus,
        attributes: stringMap(v['attributes']),
      }
    : undefined
}
