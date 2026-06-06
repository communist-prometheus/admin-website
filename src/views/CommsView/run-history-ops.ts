import type { RunLog } from '@/stores/runs'

/**
 * True iff the row represents a failed send — used by the view to add
 * the `data-testid="send-log-failed"` highlight and reveal the
 * stored error on click.
 * @param status Send-log row status.
 * @returns Whether the row is in the failed terminal state.
 */
export const isFailedRun = (status: RunLog['status']): boolean =>
  status === 'failed'

/**
 * Map a status to the BEM-ish class name used by the badge component.
 * Kept outside the component so it can be tested without DOM setup.
 * @param status Send-log row status.
 * @returns Class suffix attached to the badge element.
 */
export const statusBadgeClass = (status: RunLog['status']): string =>
  `badge-${status}`

/**
 * Format a parseable ISO timestamp as `YYYY-MM-DD HH:MM` (UTC).
 * @param iso ISO-8601 UTC timestamp (already verified parseable).
 * @returns Short UTC label.
 */
const formatIso = (iso: string): string => {
  const d = new Date(Date.parse(iso))
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}`
}

/**
 * Render an ISO timestamp as a tight `YYYY-MM-DD HH:MM` UTC label.
 * Echoes the raw value back when the input is unparseable so the
 * editor still sees the bad data instead of a blank cell.
 * @param iso ISO-8601 UTC timestamp.
 * @returns Short label for display.
 */
export const shortTickAt = (iso: string): string =>
  Number.isFinite(Date.parse(iso)) ? formatIso(iso) : iso
