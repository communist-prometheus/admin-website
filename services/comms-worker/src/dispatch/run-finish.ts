import { logEvent } from '../log/structured'
import { buildReport } from './report'
import { retentionCutoffIso } from './run-helpers'
import type { RunDispatchDeps } from './types'

const DEFAULT_RETENTION_DAYS = 90

/**
 * Mail the run report back to the newsletter's own From address. Never
 * throws: a broken report must not fail the tick that just succeeded.
 * @param d Dispatch deps.
 * @param skipped Subscribers with no new content this tick.
 * @param pausedUntil ISO resume instant when the tick paused on a quota.
 */
export const reportRun = async (
  d: RunDispatchDeps,
  skipped: number,
  pausedUntil?: string
): Promise<void> => {
  try {
    const rows = await d.sendLogRepo.listByTick(d.tickAt.toISOString())
    const res = await d.resend.send(
      buildReport(d.fromAddress, d.tickAt, rows, skipped, pausedUntil)
    )
    logEvent('report.sent', { ok: res.ok })
  } catch (e) {
    logEvent('report.fail', { error: String(e) })
  }
}

/**
 * Close out a tick: report what happened, then sweep send_log rows past
 * the retention window. Reporting comes FIRST so the rows it reads are
 * still there — and it runs on every tick that fires, because a tick
 * that reached nobody is exactly the one worth hearing about.
 * @param d Dispatch deps.
 * @param skipped Subscribers with no new content this tick.
 * @param pausedUntil ISO resume instant when the tick paused on a quota.
 */
export const finishTick = async (
  d: RunDispatchDeps,
  skipped: number,
  pausedUntil?: string
): Promise<void> => {
  await reportRun(d, skipped, pausedUntil)
  await d.sendLogRepo.purgeOlderThan(
    retentionCutoffIso(d.tickAt, d.retentionDays ?? DEFAULT_RETENTION_DAYS)
  )
}
