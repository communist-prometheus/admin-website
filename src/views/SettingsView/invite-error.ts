/*
 * The dialog offers a "send invite as @<username>" fallback when a
 * previous email-based invite failed. We used to trigger it on a
 * specific error string ("No GitHub account is associated with..."),
 * which was the message from our own pre-lookup gate — a gate that no
 * longer exists (we pass the email straight to GitHub now). Any error
 * response from the invite API, coupled with an email in the input,
 * is enough to justify surfacing the fallback: the receiver either has
 * no GitHub account or their address is not in a form GitHub can match.
 */

const looksLikeEmail = (v: string): boolean => {
  const at = v.indexOf('@')
  return at > 0 && at < v.length - 1
}

/**
 * Whether to offer the "try as username" fallback for the current
 * dialog state.
 *
 * @param identifier Raw input value the editor typed.
 * @param error Error string surfaced by the parent invite API.
 * @returns true when the input is an email AND an error is present.
 */
export const shouldOfferUsernameFallback = (
  identifier: string,
  error: string | undefined
): boolean => error !== undefined && looksLikeEmail(identifier.trim())

const guessFromAt = (v: string, at: number): string =>
  at < 0 ? v : at === 0 ? '' : v.slice(0, at)

/**
 * Best-effort GitHub username extracted from a free-form
 * identifier the editor typed. When the input looks like an
 * email (`local@domain`), returns the local part; when it looks
 * like a bare username (no `@`), returns it unchanged; otherwise
 * empty string.
 *
 * @param identifier Raw input value.
 * @returns Username candidate, or '' when extraction fails.
 */
export const usernameGuess = (identifier: string): string => {
  const v = identifier.trim()
  return v === '' ? '' : guessFromAt(v, v.indexOf('@'))
}
