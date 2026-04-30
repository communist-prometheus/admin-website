import type { LogRecord } from './otlp-types'
import type { StorageBindings } from './storage-types'

const INSERT_LOG_SQL =
  'INSERT INTO logs (trace_id, span_id, level, message, at, attrs) ' +
  'VALUES (?, ?, ?, ?, ?, ?)'

const indexLogD1 = (
  bindings: StorageBindings,
  log: LogRecord
): Promise<unknown> => {
  const db = bindings.D1
  return db === undefined
    ? Promise.resolve()
    : db
        .prepare(INSERT_LOG_SQL)
        .bind(
          log.traceId ?? null,
          log.spanId ?? null,
          log.level,
          log.message,
          log.at,
          JSON.stringify(log.attributes ?? {})
        )
        .run()
}

/**
 * Persist a batch of validated logs to D1.
 * @param bindings Storage bindings on the worker env.
 * @param logs Validated logs to persist.
 * @returns Resolves once all writes complete.
 */
export const persistLogs = async (
  bindings: StorageBindings,
  logs: readonly LogRecord[]
): Promise<void> => {
  await Promise.all(logs.map(log => indexLogD1(bindings, log)))
}
