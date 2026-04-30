/** Log severity carried on a log record. Mirrors the collector. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Log entry as accepted by the collector's `/v1/logs`. */
export type LogRecord = {
  readonly traceId: string | undefined
  readonly spanId: string | undefined
  readonly level: LogLevel
  readonly message: string
  readonly at: number
  readonly attributes: Readonly<Record<string, string>>
}
