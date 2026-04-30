import type { SpanRecord } from './otlp-types'
import type { StorageBindings } from './storage-types'

/**
 * Forward a span to Workers Analytics Engine. No-op when the
 * dataset binding is absent (local dev / unit tests).
 * @param bindings Worker env bindings.
 * @param span Validated span record.
 * @param user GitHub login from the JWT subject.
 * @returns void
 */
export const writeSpanAnalytics = (
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
