import {
  type LoopCtx,
  POLL_INTERVAL_MS,
  visibilityHidden,
} from './loop-types'
import { allTerminal } from './poll-entries'
import { runTick } from './poll-tick'
import type { PollContext } from './poll-types'

/**
 * Create a schedule closure bound to a loop ctx + poll context.
 * The closure re-arms a timer for the next tick only if still in
 * polling phase and the page is visible.
 * @param c - Loop context (mutable timer + phase)
 * @param poll - Poll context passed to runTick
 * @returns Schedule function
 */
export const makeSchedule = (c: LoopCtx, poll: PollContext) => (): void => {
  if (c.phase.value !== 'polling') return
  if (visibilityHidden()) {
    c.phase.value = 'paused'
    return
  }
  c.timer = setTimeout(() => void runTick(poll), POLL_INTERVAL_MS)
}

/**
 * Create a start closure that enters polling phase and runs the
 * first tick synchronously. No-op if already polling.
 * @param c - Loop context
 * @param poll - Poll context
 * @returns Async start function
 */
export const makeStart =
  (c: LoopCtx, poll: PollContext) => async (): Promise<void> => {
    if (c.phase.value === 'polling') return
    c.phase.value = 'polling'
    await runTick(poll)
  }

/**
 * Create a stop closure that clears any pending timer and drops
 * the loop to the idle phase.
 * @param c - Loop context
 * @returns Stop function
 */
export const makeStop = (c: LoopCtx) => (): void => {
  if (c.timer) clearTimeout(c.timer)
  c.timer = undefined
  c.phase.value = 'idle'
}

/**
 * Create a visibilitychange handler: pauses on hide, resumes on
 * focus only when there is something non-terminal to poll for.
 * @param c - Loop context
 * @param requestPoll - Callback to resume polling on refocus
 * @returns Visibility handler
 */
export const makeOnVisibility =
  (c: LoopCtx, requestPoll: () => void) => (): void => {
    if (visibilityHidden()) {
      if (c.timer) clearTimeout(c.timer)
      c.timer = undefined
      if (c.phase.value === 'polling') c.phase.value = 'paused'
      return
    }
    if (!allTerminal(c.state.entries.value)) requestPoll()
  }
