import { MAX_TEXT_LENGTH } from './config'

/**
 * Truncate a free-text field to the PII budget.
 * @param s - Raw string
 * @param max - Maximum length to keep
 * @returns Same string or a truncated copy ending with an ellipsis
 */
export const truncate = (s: string, max = MAX_TEXT_LENGTH): string =>
  s.length <= max ? s : `${s.slice(0, max)}…`

/**
 * Drop everything after `?` / `#`. Query strings and fragments are
 * where credentials travel (`?code=`, `?t=<unsubscribe token>`,
 * OAuth `state`…) — and the history JSON is attached to tickets in
 * a PUBLIC repo. Origin + path stay for diagnostics.
 * @param raw - URL or SPA route string
 * @returns The string without query string and fragment
 */
export const stripQuery = (raw: string): string => {
  const cut = raw.search(/[?#]/)
  return cut === -1 ? raw : raw.slice(0, cut)
}
