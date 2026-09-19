/** Resend answers 409 while an identical idempotent request is in flight. */
export const CONFLICT = 409

/**
 * Attempts per batch, and the base backoff between them.
 *
 * A 100-email batch takes Resend seconds to accept, so the old single
 * retry after a flat 1s landed while the original was still in flight
 * and collected a 409. Back off exponentially (2s, 4s, 8s) and give the
 * original time to settle: on a retry Resend replays whatever it
 * recorded against our idempotency key, so a batch that WAS accepted
 * comes back `ok` with its real ids instead of being written off.
 */
const MAX_ATTEMPTS = 4
const BASE_BACKOFF_MS = 2_000

/**
 * A 409 gets a budget of its own, because it is not an error: it says
 * the identical request is still being processed, and the only useful
 * response is to keep asking until Resend replays what it recorded.
 * Four attempts over fourteen seconds were not enough on 2026-09-12 —
 * a 100-email batch outlived them and 100 recipients were written off
 * as failed, then mailed again a week later. The backoff is capped so
 * the budget buys attempts rather than one long sleep.
 */
const CONFLICT_ATTEMPTS = 9
const CONFLICT_CAP_MS = 15_000

export const attemptsFor = (status: number): number =>
  status === CONFLICT ? CONFLICT_ATTEMPTS : MAX_ATTEMPTS

export const backoffMs = (
  attempt: number,
  hinted: number,
  status: number
): number => {
  const grown = BASE_BACKOFF_MS * 2 ** (attempt - 1)
  const capped =
    status === CONFLICT ? Math.min(grown, CONFLICT_CAP_MS) : grown
  return Math.max(hinted, capped)
}
