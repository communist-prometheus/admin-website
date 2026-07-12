/** Outcome of parsing the optional `lastSentAt` field of a patch. */
export type ParsedStamp =
  | string
  | null
  | undefined
  | { readonly error: 'lastSentAt' }

/**
 * Parse the `lastSentAt` field of a `PATCH /api/subscribers/:id` body.
 * Absent means "not part of this patch"; `null` clears the watermark.
 * Normalised to ISO-8601 UTC so dispatch always compares like with like.
 * @param raw Raw field value.
 * @returns The stamp, null, undefined, or an error tag.
 */
export const parseLastSent = (raw: unknown): ParsedStamp => {
  if (raw === undefined) return undefined
  if (raw === null) return null
  const ms = typeof raw === 'string' ? Date.parse(raw) : Number.NaN
  return Number.isFinite(ms)
    ? new Date(ms).toISOString()
    : { error: 'lastSentAt' }
}

/**
 * Narrow a {@link ParsedStamp} to its error case.
 * @param s Parsed stamp.
 * @returns Whether parsing failed.
 */
export const isStampError = (
  s: ParsedStamp
): s is { readonly error: 'lastSentAt' } =>
  typeof s === 'object' && s !== null
