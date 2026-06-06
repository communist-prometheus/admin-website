const TOKEN_RE = /([?&])t=[^&]*/g

/**
 * Replace every `t=…` query parameter value with `t=…`. Operates on any
 * string, so the helper is safe for partial query fragments or full URLs.
 * @param input Raw string that may carry a token.
 * @returns Same string with token values redacted.
 */
export const scrubTokenQuery = (input: string): string => {
  const scrubbed = input.replace(TOKEN_RE, '$1t=…')
  return scrubbed.startsWith('t=') && !scrubbed.startsWith('t=…')
    ? 't=…'.concat(scrubbed.slice(scrubbed.indexOf('&')))
    : scrubbed.startsWith('t=')
      ? scrubbed
      : input.startsWith('t=')
        ? input.replace(/^t=[^&]*/, 't=…')
        : scrubbed
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Mask an email's local part while preserving the domain for routing
 * diagnostics. Unparseable strings collapse to a generic ellipsis.
 * @param raw Raw value, possibly an email.
 * @returns Masked string suitable for structured logs.
 */
export const maskEmail = (raw: string): string => {
  if (!EMAIL_RE.test(raw)) return '…'
  const at = raw.lastIndexOf('@')
  return `…${raw.slice(at)}`
}

const SCRUB_URL_KEYS = new Set(['url', 'path', 'location'])
const MASK_EMAIL_KEYS = new Set(['email', 'to', 'from'])

/**
 * Walk a structured-log payload, masking known-PII keys (emails) and
 * scrubbing token values from URL-like keys. Non-string fields and
 * unknown keys are passed through unchanged.
 * @param payload Caller-supplied payload object.
 * @returns Copy with sensitive fields redacted.
 */
export const redactPayload = (
  payload: Readonly<Record<string, unknown>>
): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string' && SCRUB_URL_KEYS.has(k))
      out[k] = scrubTokenQuery(v)
    else if (typeof v === 'string' && MASK_EMAIL_KEYS.has(k))
      out[k] = maskEmail(v)
    else out[k] = v
  }
  return out
}
