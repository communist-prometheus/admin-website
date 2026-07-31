/** Callbacks the scheduler drives as the session evolves. */
export interface RefreshHooks {
  readonly onRefreshed: (token: string) => void
  readonly onDead: () => void
}

/** Mutable state threaded through scheduler ticks. */
export interface SchedulerState {
  lastToken: string | undefined
  stopped: boolean
}

const notifyNew = (
  token: string,
  state: SchedulerState,
  hooks: RefreshHooks
): void => {
  state.lastToken = token
  hooks.onRefreshed(token)
}

/**
 * Route a freshly-resolved token to the right callback: a dead session
 * fires `onDead`; an unchanged token does nothing; a new token fires
 * `onRefreshed` exactly once.
 * @param token - Result of ensureFreshToken
 * @param state - Mutable scheduler state (last token seen)
 * @param hooks - Refresh/dead callbacks
 */
export const applyToken = (
  token: string | undefined,
  state: SchedulerState,
  hooks: RefreshHooks
): void => {
  void (token === undefined
    ? hooks.onDead()
    : token === state.lastToken
      ? undefined
      : notifyNew(token, state, hooks))
}
