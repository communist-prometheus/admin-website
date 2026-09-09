/**
 * One dispatch tick, folded back together from the per-recipient
 * `send_log` rows it wrote. `articleCount` is the size of the digest
 * that tick carried; the counters say how the recipients ended up.
 */
export type TickSummary = {
  readonly tickAt: string
  readonly recipients: number
  readonly sent: number
  readonly failed: number
  readonly bounced: number
  readonly complained: number
  readonly skipped: number
  readonly articleCount: number
}

/** Raw aggregate row the grouped query returns. */
export type TickRow = {
  readonly tick_at: string
  readonly recipients: number
  readonly sent: number
  readonly failed: number
  readonly bounced: number
  readonly complained: number
  readonly skipped: number
  readonly article_count: number
}

/**
 * Lift one aggregate row into the domain {@link TickSummary}.
 * @param r Raw aggregate row.
 * @returns Domain summary.
 */
export const rowToTick = (r: TickRow): TickSummary => ({
  tickAt: r.tick_at,
  recipients: r.recipients,
  sent: r.sent,
  failed: r.failed,
  bounced: r.bounced,
  complained: r.complained,
  skipped: r.skipped,
  articleCount: r.article_count,
})
