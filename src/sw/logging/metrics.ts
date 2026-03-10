import type { SWMetricsResponse } from '../protocol'

/** Per-operation timing accumulator */
interface OpStats {
  count: number
  totalMs: number
}

/** Internal metrics state */
interface MetricsState {
  readonly ops: Record<string, OpStats>
  readonly cache: { hits: number; misses: number }
  readonly startTime: number
}

const state: MetricsState = {
  ops: {},
  cache: { hits: 0, misses: 0 },
  startTime: Date.now(),
}

/**
 * Record the duration of a named operation.
 * @param name - Operation name (e.g. 'clone', 'push', 'readFile')
 * @param durationMs - Duration in milliseconds
 */
export const recordOp = (name: string, durationMs: number): void => {
  const existing = state.ops[name]
  if (existing) {
    existing.count++
    existing.totalMs += durationMs
  } else {
    state.ops[name] = { count: 1, totalMs: durationMs }
  }
}

/**
 * Record a cache hit.
 */
export const recordCacheHit = (): void => {
  state.cache.hits++
}

/**
 * Record a cache miss.
 */
export const recordCacheMiss = (): void => {
  state.cache.misses++
}

/**
 * Get current metrics snapshot.
 * @returns Metrics response object
 */
export const getMetrics = (): SWMetricsResponse => ({
  ops: { ...state.ops },
  cache: { ...state.cache },
  uptime: Date.now() - state.startTime,
})
