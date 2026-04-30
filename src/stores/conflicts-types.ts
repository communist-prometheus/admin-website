/** Persisted record of an unresolved auto-merge attempt. */
export type ConflictRecord = {
  readonly sha: string
  readonly target: string
  readonly files: ReadonlyArray<string>
  readonly at: number
}
