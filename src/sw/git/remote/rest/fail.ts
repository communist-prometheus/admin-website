/**
 * Throw an Error from an expression position (e.g. `value ?? fail(msg)` or
 * a ternary's else branch), keeping call sites free of `if` statements.
 * @param message - Error message
 * @returns Never — always throws
 */
export const fail = (message: string): never => {
  throw new Error(message)
}
