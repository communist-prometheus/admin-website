/** Frontmatter keys that carry a publication date, across content vintages. */
const DATE_KEYS: readonly string[] = ['pubDate', 'publishDate', 'date']

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Whether `YYYY-MM-DD` survives a round-trip through Date. This is what
 * rejects a day the month does not have: `2026-02-31` rolls forward to March
 * and comes back as a different string.
 * @param ymd - the matched year, month and day, as written
 * @returns true when the three parts name a real calendar day
 */
const roundTrips = (ymd: readonly string[]): boolean => {
  const [y, mo, d] = ymd
  const at = new Date(`${y}-${mo}-${d}T00:00:00Z`)
  return (
    Number.isFinite(at.getTime()) &&
    at.toISOString().slice(0, 10) === `${y}-${mo}-${d}`
  )
}

/**
 * Whether a frontmatter string denotes a real day.
 * @param value - the raw string as the YAML parser left it
 * @returns true when it is a date the site can render
 */
const fromString = (value: string): boolean => {
  const m = ISO_DAY.exec(value.trim())
  return m === null
    ? Number.isFinite(Date.parse(value))
    : roundTrips([m[1] ?? '', m[2] ?? '', m[3] ?? ''])
}

/**
 * Whether a frontmatter value denotes a real calendar day. An unambiguous
 * timestamp is already a Date by the time YAML is done with it; anything still
 * a string has to stand on its own.
 * @param value - the parsed frontmatter value
 * @returns true when the value is a usable date
 */
const isRealDate = (value: unknown): boolean =>
  value instanceof Date
    ? Number.isFinite(value.getTime())
    : typeof value === 'string'
      ? fromString(value)
      : false

/**
 * Rule 5: every date key present holds a real calendar day.
 *
 * `publishDate: 2026-15-09` is valid YAML and a valid string, so it passed
 * every earlier rule — and then Astro's schema refused the entry, the build's
 * quarantine dropped the file, and the article was a 404 for twelve days while
 * the deploy stayed green.
 * @param fm - parsed frontmatter record
 * @returns the failing reason, or undefined when every date is real
 */
export const dateReason = (
  fm: Record<string, unknown>
): string | undefined => {
  const bad = DATE_KEYS.filter(
    key => fm[key] !== undefined && fm[key] !== null
  ).find(key => !isRealDate(fm[key]))
  return bad === undefined
    ? undefined
    : `${bad} (${String(fm[bad])}) is not a real calendar date — use YYYY-MM-DD`
}
