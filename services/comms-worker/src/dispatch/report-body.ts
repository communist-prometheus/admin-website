import { htmlEscape } from '../digest/escape'
import type { SendLogWithEmail } from '../send-log/with-email'

const addressOf = (row: SendLogWithEmail): string =>
  row.email ?? `subscriber #${row.subscriberId ?? '?'}`

const withError = (row: SendLogWithEmail): string =>
  `${addressOf(row)} — ${row.error ?? 'unknown error'}`

/** The three buckets a run report is written from. */
export type ReportParts = {
  readonly tickAt: Date
  readonly sent: ReadonlyArray<SendLogWithEmail>
  readonly failed: ReadonlyArray<SendLogWithEmail>
  readonly skipped: number
}

/**
 * Plain-text report body — the failures first, because that is the only
 * part worth reading when something went wrong.
 * @param p Report parts.
 * @returns Text body.
 */
export const textBody = (p: ReportParts): string =>
  [
    `Tick: ${p.tickAt.toISOString()}`,
    `Sent: ${p.sent.length}`,
    `Failed: ${p.failed.length}`,
    `Skipped (no new content): ${p.skipped}`,
    '',
    p.failed.length > 0 ? 'FAILED' : 'No failures.',
    ...p.failed.map(r => `  ${withError(r)}`),
    '',
    'SENT',
    ...p.sent.map(r => `  ${addressOf(r)}`),
  ].join('\n')

const list = (rows: ReadonlyArray<string>): string =>
  rows.length === 0
    ? '<p>None.</p>'
    : `<ul>${rows.map(r => `<li>${htmlEscape(r)}</li>`).join('')}</ul>`

/**
 * HTML report body. Recipient data is escaped — an address or a Resend
 * error is untrusted text as far as this template is concerned.
 * @param p Report parts.
 * @returns HTML body.
 */
export const htmlBody = (p: ReportParts): string =>
  [
    '<h2>Newsletter run</h2>',
    `<p>Tick: ${htmlEscape(p.tickAt.toISOString())}</p>`,
    `<p><strong>${p.sent.length}</strong> sent, `,
    `<strong>${p.failed.length}</strong> failed, `,
    `${p.skipped} skipped (no new content).</p>`,
    '<h3>Failed</h3>',
    list(p.failed.map(withError)),
    '<h3>Sent</h3>',
    list(p.sent.map(addressOf)),
  ].join('')
