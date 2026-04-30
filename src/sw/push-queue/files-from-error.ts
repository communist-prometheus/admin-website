const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

/**
 * Inspect an isomorphic-git merge error and return the list of
 * conflict file paths it carries on `error.data.filepaths`. Falls
 * back to an empty array so callers always get a list. Pure —
 * no fs / git dependencies — so unit tests don't need IDB shims.
 * @param error Raw error from `git.pull` / `git.merge`.
 * @returns Conflict file paths reported by the error payload.
 */
export const filesFromError = (error: unknown): ReadonlyArray<string> => {
  const data = isObject(error) ? error['data'] : undefined
  const filepaths = isObject(data) ? data['filepaths'] : undefined
  return Array.isArray(filepaths)
    ? filepaths.filter((p): p is string => typeof p === 'string')
    : []
}
