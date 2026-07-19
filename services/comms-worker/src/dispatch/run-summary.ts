import { logEvent } from '../log/structured'
import type { DispatchSummary } from './types'

/**
 * Assemble the per-tick summary, stamp its wall-clock duration, log the
 * `tick.done` event and hand the summary back to the caller.
 * @param counts Sent / failed / skipped tallies for this tick.
 * @param start `Date.now()` captured at tick start.
 * @param pausedUntil ISO resume instant when a quota paused the run.
 * @returns The dispatch summary.
 */
export const summarize = (
  counts: {
    readonly sent: number
    readonly failed: number
    readonly skipped: number
  },
  start: number,
  pausedUntil?: string
): DispatchSummary => {
  const result: DispatchSummary = {
    ...counts,
    durationMs: Date.now() - start,
    ...(pausedUntil ? { pausedUntil } : {}),
  }
  logEvent('tick.done', { ...result })
  return result
}
