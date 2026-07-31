import { ensureFreshToken } from './ensure-fresh-token'
import {
  applyToken,
  type RefreshHooks,
  type SchedulerState,
} from './refresh-notify'

export type { RefreshHooks } from './refresh-notify'

/*
 * Poll on a coarse interval rather than a single timer at the exact
 * expiry: an interval resumes cleanly after the machine sleeps, and
 * ensureFreshToken only renews once inside its skew window, so ticks are
 * cheap. Visibility/focus ticks catch a tab left open past expiry.
 */
const CHECK_INTERVAL_MS = 5 * 60 * 1000

/**
 * Start proactively renewing the access token before it expires. Invokes
 * `onRefreshed` with each newly-rotated token (so callers can re-init the
 * Service Worker) and `onDead` when the session can no longer be renewed.
 * @param hooks - Refresh/dead callbacks
 * @returns A stop function that removes all timers and listeners
 */
export const startTokenRefresh = (hooks: RefreshHooks): (() => void) => {
  const state: SchedulerState = { lastToken: undefined, stopped: false }
  const tick = async (): Promise<void> => {
    const token = await ensureFreshToken()
    void (state.stopped ? undefined : applyToken(token, state, hooks))
  }
  const run = (): void => void tick()
  const onVisible = (): void => {
    void (globalThis.document?.visibilityState === 'visible'
      ? run()
      : undefined)
  }
  const interval = globalThis.setInterval(run, CHECK_INTERVAL_MS)
  globalThis.document?.addEventListener('visibilitychange', onVisible)
  globalThis.addEventListener?.('focus', run)
  return (): void => {
    state.stopped = true
    globalThis.clearInterval(interval)
    globalThis.document?.removeEventListener('visibilitychange', onVisible)
    globalThis.removeEventListener?.('focus', run)
  }
}
