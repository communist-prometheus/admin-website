import type { LogRecord } from '@/composables/useTracing/log-record'
import type { RemoteSpan } from '@/composables/useTracing/remote-span'

/** Body returned by `GET /v1/traces/:traceId`. */
export type TraceDetailBody = {
  readonly traceId: string
  readonly spans: ReadonlyArray<RemoteSpan>
  readonly logs: ReadonlyArray<LogRecord>
}

/** Recognised detail-fetch errors. */
export type DetailError = 'forbidden' | 'not-found' | 'unknown' | undefined

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

/**
 * Type guard for the trace detail response body. Loose check:
 * accepts any object with a string `traceId` and array `spans` /
 * `logs` — the panel tolerates missing optional fields.
 * @param value Raw fetch body.
 * @returns True when the value matches `TraceDetailBody`.
 */
export const isDetailBody = (value: unknown): value is TraceDetailBody =>
  isObject(value) &&
  typeof value['traceId'] === 'string' &&
  Array.isArray(value['spans']) &&
  Array.isArray(value['logs'])

/**
 * Map an HTTP status code to a panel-renderable error union.
 * @param status Response status.
 * @returns Discriminated error.
 */
export const errorFor = (status: number): DetailError =>
  status === 403 ? 'forbidden' : status === 404 ? 'not-found' : 'unknown'
