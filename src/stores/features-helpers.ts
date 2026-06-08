/**
 * Throw with a descriptive message on a non-2xx response so the
 * surrounding try/catch in the store actions can surface the
 * failure on `r.error`.
 * @param res Fetch response.
 * @returns The same response on success.
 */
export const ensureOk = (res: Response): Response =>
  res.ok
    ? res
    : (() => {
        throw new Error(`Save failed: ${res.status}`)
      })()

/**
 * Extract a human-readable message from any thrown value.
 * @param e Thrown value.
 * @param fallback Message used when `e` isn't an `Error`.
 * @returns Message string.
 */
export const messageOf = (e: unknown, fallback: string): string =>
  e instanceof Error ? e.message : fallback
