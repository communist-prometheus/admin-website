/**
 * Wipe localStorage AND sessionStorage. Private modes / disabled storage
 * throw on write; catch and move on — there's nothing to clear.
 *
 * @returns Resolves immediately (the underlying API is synchronous;
 *   returning a Promise keeps this composable with the same shape as
 *   the other steps so the orchestrator can await it uniformly).
 */
export const clearWebStorage = async (): Promise<void> => {
  try {
    localStorage.clear()
  } catch {
    /* private mode / disabled — nothing to clear */
  }
  try {
    sessionStorage.clear()
  } catch {
    /* private mode / disabled — nothing to clear */
  }
}
