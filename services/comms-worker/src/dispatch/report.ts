import type { SendInput } from '../resend/types'
import type { SendLogWithEmail } from '../send-log/with-email'
import { htmlBody, textBody } from './report-body'

/*
 * Post-run report, mailed back to the address the newsletter is sent
 * from after every tick that fires — including a tick that reaches
 * nobody.
 *
 * Silence is exactly what hid the 2026-07-11 breakage: 100 of 123
 * recipients were dropped and nothing anywhere said so. A report in the
 * inbox either way turns "did the newsletter go out?" into a glance at
 * the subject line.
 */

const dayOf = (tickAt: Date): string => tickAt.toISOString().slice(0, 10)

/**
 * Build the post-run report email from the rows the tick actually
 * persisted, so it describes what was recorded rather than what an
 * in-memory counter believed.
 * @param fromAddress The newsletter's own From — also the recipient.
 * @param tickAt Tick moment.
 * @param rows Every send_log row written by this tick.
 * @param skipped Subscribers with no new content this tick.
 * @param pausedUntil ISO resume instant when the tick paused on a quota.
 * @returns Ready-to-send Resend payload.
 */
export const buildReport = (
  fromAddress: string,
  tickAt: Date,
  rows: ReadonlyArray<SendLogWithEmail>,
  skipped: number,
  pausedUntil?: string
): SendInput => {
  const sent = rows.filter(r => r.status === 'sent')
  const failed = rows.filter(r => r.status === 'failed')
  const parts = { tickAt, sent, failed, skipped, pausedUntil }
  const verdict =
    pausedUntil !== undefined
      ? 'PAUSED'
      : failed.length === 0
        ? 'OK'
        : 'FAILED'
  return {
    from: fromAddress,
    to: fromAddress,
    subject: `[newsletter ${verdict}] ${dayOf(tickAt)} — ${sent.length} sent, ${failed.length} failed`,
    text: textBody(parts),
    html: htmlBody(parts),
  }
}
