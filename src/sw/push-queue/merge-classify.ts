/** Outcome of a single auto-merge attempt. */
export type MergeOutcome =
  | { readonly kind: 'clean' }
  | {
      readonly kind: 'conflict'
      readonly files: ReadonlyArray<string>
    }
  | { readonly kind: 'fail'; readonly error: unknown }

/**
 * True when the error is isomorphic-git's merge-conflict signal.
 * @param error Raw error thrown by a merge/pull attempt.
 * @returns Whether the error denotes content conflicts.
 */
export const isMergeConflict = (error: unknown): boolean =>
  error instanceof Error && error.name === 'MergeConflictError'

/**
 * True when isomorphic-git refuses the merge for lack of a common
 * ancestor — the state every browser clone fell into after the
 * content repo's history was force-pushed (identity rewrite).
 * @param error Raw error thrown by a merge/pull attempt.
 * @returns Whether the histories are unrelated.
 */
export const isUnrelatedHistories = (error: unknown): boolean =>
  error instanceof Error && error.name === 'MergeNotSupportedError'
