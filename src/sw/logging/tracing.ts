/** Trace span representing a timed operation */
export interface Span {
  readonly id: string
  readonly op: string
  readonly start: number
  end: number | undefined
  readonly children: Span[]
  status: 'running' | 'ok' | 'error'
  error: string | undefined
}

let idCounter = 0

/**
 * Generate a unique span ID.
 * @returns Short unique identifier
 */
const nextId = (): string => `sp_${++idCounter}`

/**
 * Create and start a new trace span.
 * @param op - Operation name
 * @returns The started span
 */
export const startSpan = (op: string): Span => ({
  id: nextId(),
  op,
  start: Date.now(),
  end: undefined,
  children: [],
  status: 'running',
  error: undefined,
})

/**
 * Mark a span as successfully completed.
 * @param span - The span to finish
 */
export const endSpan = (span: Span): void => {
  span.end = Date.now()
  span.status = 'ok'
}

/**
 * Mark a span as failed.
 * @param span - The span to mark
 * @param error - Error message
 */
export const failSpan = (span: Span, error: string): void => {
  span.end = Date.now()
  span.status = 'error'
  span.error = error
}

/**
 * Get duration of a completed span in milliseconds.
 * @param span - The span to measure
 * @returns Duration in ms, or 0 if not finished
 */
export const spanDuration = (span: Span): number =>
  span.end ? span.end - span.start : 0
