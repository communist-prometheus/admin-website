interface RefStatus {
  readonly ok: boolean
  readonly error?: string | null
}

/** The subset of isomorphic-git's `PushResult` we inspect. */
export interface PushResultLike {
  readonly ok?: boolean
  readonly error?: string | null
  readonly refs?: Record<string, RefStatus>
}

/**
 * Reduce a `git.push` result to a rejection message, or `undefined` when
 * the push truly landed. isomorphic-git reports the unpack-stage status in
 * `result.error` but the actual ref update in `result.refs[ref].ok` — a
 * connectivity / non-fast-forward rejection sets only the latter, so a
 * check of `result.error` alone reads a rejected push as success and
 * silently drops the edit.
 * @param result The push result (or the subset we read).
 * @returns A rejection message when the push failed, else `undefined`.
 */
export const pushRejection = (result: PushResultLike): string | undefined => {
  const refFailure = Object.values(result.refs ?? {}).find(ref => !ref.ok)
  return (
    result.error ??
    (result.ok === false || refFailure !== undefined
      ? (refFailure?.error ?? 'ref update rejected')
      : undefined)
  )
}
