/*
 * GitHub returns a fixed message when the email-based invite
 * lookup misses ("No GitHub account is associated with <email>.
 * Ask the person to make their email public on GitHub or invite
 * by username."). Detect that exact case so the dialog can offer
 * a "try as username" fallback instead of dead-ending the editor.
 */

const NO_ACCOUNT_RE = /no github account is associated with/i

/**
 * Detect GitHub's "no account associated with this email" error.
 *
 * @param error Current error string surfaced by the parent invite
 *   API (or the dialog's own validation).
 * @returns true when the error is GitHub's email-lookup-miss.
 */
export const isEmailLookupMiss = (error: string | undefined): boolean =>
  error !== undefined && NO_ACCOUNT_RE.test(error)

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
