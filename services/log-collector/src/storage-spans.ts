import type { SpanRecord } from './otlp-types'
import { writeSpanAnalytics } from './storage-spans-analytics'
import type { StorageBindings } from './storage-types'

const INSERT_SPAN_SQL =
  'INSERT OR REPLACE INTO spans ' +
  '(trace_id, span_id, parent_span_id, name, started_at, finished_at, status, attrs, user) ' +
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'

const indexSpanD1 = (
  bindings: StorageBindings,
  span: SpanRecord,
  user: string
): Promise<unknown> => {
  const db = bindings.D1
  return db === undefined
    ? Promise.resolve()
    : db
        .prepare(INSERT_SPAN_SQL)
        .bind(
          span.traceId,
          span.spanId,
          span.parentSpanId ?? null,
          span.name,
          span.startedAt,
          span.finishedAt,
          span.status,
          JSON.stringify(span.attributes ?? {}),
          user
        )
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
