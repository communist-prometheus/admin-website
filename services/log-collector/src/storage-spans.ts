import type { SpanRecord } from './otlp-types'
import type { StorageBindings } from './storage-types'

const INSERT_TRACE_SQL =
  'INSERT INTO traces (trace_id, user, op, started_at) VALUES (?, ?, ?, ?)'

const writeSpanAnalytics = (
  bindings: StorageBindings,
  span: SpanRecord,
  user: string
): void => {
  const ds = bindings.ANALYTICS_DATASET
  const noop = (): void => undefined
  const fire =
    ds === undefined
      ? noop
      : () =>
          ds.writeDataPoint({
            indexes: [span.traceId, user],
            blobs: [span.name, span.spanId, span.status],
            doubles: [span.startedAt, span.finishedAt],
          })
  fire()
}

const indexSpanD1 = (
  bindings: StorageBindings,
  span: SpanRecord,
  user: string
): Promise<unknown> => {
  const db = bindings.D1
  return db === undefined
    ? Promise.resolve()
    : db
        .prepare(INSERT_TRACE_SQL)
        .bind(span.traceId, user, span.name, span.startedAt)
        .run()
}

/**
 * Persist a batch of validated spans to Analytics Engine + D1.
 * No-op when bindings are absent (local dev / tests).
 * @param bindings Storage bindings on the worker env.
 * @param spans Validated spans to persist.
 * @param user GitHub login from the JWT subject claim.
 * @returns Resolves once all writes complete.
 */
export const persistSpans = async (
  bindings: StorageBindings,
  spans: readonly SpanRecord[],
  user: string
): Promise<void> => {
  spans.forEach(span => {
    writeSpanAnalytics(bindings, span, user)
  })
  await Promise.all(spans.map(span => indexSpanD1(bindings, span, user)))
}
