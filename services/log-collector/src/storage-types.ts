/** Workers Analytics Engine binding shape (subset we use). */
export type AnalyticsEngineDataset = {
  readonly writeDataPoint: (point: {
    readonly indexes: ReadonlyArray<string>
    readonly blobs?: ReadonlyArray<string>
    readonly doubles?: ReadonlyArray<number>
  }) => void
}

/** D1 database binding shape (subset we use). */
export type D1Database = {
  readonly prepare: (sql: string) => D1PreparedStatement
}

/** D1 row of unknown shape — narrowed by callers via type guards. */
export type D1Row = Readonly<Record<string, unknown>>

/** Result of `all()` on a prepared statement. */
export type D1Result = {
  readonly results: ReadonlyArray<D1Row>
  readonly success: boolean
}

/** D1 prepared statement (subset). */
export type D1PreparedStatement = {
  readonly bind: (...args: ReadonlyArray<unknown>) => D1PreparedStatement
  readonly run: () => Promise<{ readonly success: boolean }>
  readonly all: () => Promise<D1Result>
}

/** Storage bindings exposed to the OTLP handlers. */
export type StorageBindings = {
  readonly ANALYTICS_DATASET: AnalyticsEngineDataset | undefined
  readonly D1: D1Database | undefined
}
