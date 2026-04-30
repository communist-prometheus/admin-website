import type { LogRecord, SpanRecord } from './otlp-types'

/** Response body for `GET /v1/traces/:traceId`. */
export type TraceDetail = {
  readonly traceId: string
  readonly spans: ReadonlyArray<SpanRecord>
  readonly logs: ReadonlyArray<LogRecord>
}
