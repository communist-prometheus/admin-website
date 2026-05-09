/**
 * Rethrow helper for ternary-shaped error filters.
 *
 * The project bans `if` in application code; the canonical pattern
 * for "swallow specific error, propagate everything else" is
 * a ternary, which needs both branches to be expressions. `throw`
 * is a statement, so we wrap it in a `never`-returning function:
 *
 * ```ts
 * catch (e) {
 *   void (isExpected(e) ? 0 : rethrow(e))
 * }
 * ```
 * @param e - The caught error to propagate
 * @returns Never returns — always throws
 */
export const rethrow = (e: unknown): never => {
  throw e
}
