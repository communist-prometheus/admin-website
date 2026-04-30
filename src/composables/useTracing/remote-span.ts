/** Span shape emitted by the collector (mirrors `SpanRecord`). */
export type RemoteSpan = {
  readonly traceId: string
  readonly spanId: string
  readonly parentSpanId: string | undefined
  readonly name: string
  readonly startedAt: number
  readonly finishedAt: number
  readonly status: 'ok' | 'error' | 'unset'
  readonly attributes: Readonly<Record<string, string>>
}

/** Connection state of a live trace subscription. */
export type TraceStreamStatus =
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'
