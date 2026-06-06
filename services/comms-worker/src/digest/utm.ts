const MS_PER_DAY = 86_400_000

/**
 * Render an ISO week designation as `YYYY-WW` for the moment `d` in UTC.
 * @param d Tick moment.
 * @returns String like `2026-23`; week is zero-padded.
 */
export const isoWeekString = (d: Date): string => {
  const t = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  )
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const yearStart = Date.UTC(t.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((t.getTime() - yearStart) / MS_PER_DAY + 1) / 7)
  return `${t.getUTCFullYear()}-${String(week).padStart(2, '0')}`
}

const UTM = 'utm_source=newsletter&utm_medium=email'

/**
 * Append the campaign triple to an article URL for analytics attribution.
 * Picks `&` over `?` when the URL already carries a query.
 * @param url Article URL.
 * @param campaign Value for `utm_campaign` (typically {@link isoWeekString}).
 * @returns URL with the UTM parameters appended.
 */
export const appendUtm = (url: string, campaign: string): string => {
  const join = url.includes('?') ? '&' : '?'
  return `${url}${join}${UTM}&utm_campaign=${campaign}`
}
