/** Status carried on a finished span. */
export type SpanStatus = 'ok' | 'error' | 'unset'

/** Span as accepted by `/v1/traces`. */
export type SpanRecord = {
  readonly traceId: string
  readonly spanId: string
  readonly parentSpanId: string | undefined
  readonly name: string
  readonly startedAt: number
  readonly finishedAt: number
  readonly status: SpanStatus
  readonly attributes: Readonly<Record<string, string>>
}

/** Log severity carried on a log record. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Log entry as accepted by `/v1/logs`. */
export type LogRecord = {
  readonly traceId: string | undefined
  readonly spanId: string | undefined
  readonly level: LogLevel
  readonly message: string
  readonly at: number
  readonly attributes: Readonly<Record<string, string>>
}
