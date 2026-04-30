/** BroadcastChannel name for SW→client merge conflict events. */
export const SW_PUSH_CONFLICT_CHANNEL = 'sw-push-conflict'

/** Emitted when an auto-merge attempt leaves conflict markers. */
export type PushConflictEvent = {
  readonly sha: string
  readonly target: string
  readonly files: ReadonlyArray<string>
  readonly at: number
}
