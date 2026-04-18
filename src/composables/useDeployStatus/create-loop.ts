import { type Ref, ref } from 'vue'
import { buildPollCtx } from './build-poll-ctx'
import type { DeployState } from './deploy-state'
import { makeOnVisibility, makeStart, makeStop } from './loop-actions'
import type { LoopCtx, LoopHandle } from './loop-types'
import type { Phase } from './poll-types'

export type { LoopHandle } from './loop-types'
export { POLL_INTERVAL_MS } from './loop-types'

const WAIT_WINDOW_MS = 180_000

/**
 * Build the poll loop bound to a reactive state.
 * @param state - Deploy state shared by the composable
 * @returns LoopHandle exposing start, stop, requestPoll
 */
export const createLoop = (state: DeployState): LoopHandle => {
  const c: LoopCtx = {
    state,
    phase: ref<Phase>('idle') as Ref<Phase>,
    timer: undefined,
    waitingForRunUntil: 0,
  }
  const poll = buildPollCtx(c)
  const start = makeStart(c, poll)
  const stop = makeStop(c)
  const requestPoll = (): void => {
    c.waitingForRunUntil = Date.now() + WAIT_WINDOW_MS
    if (c.phase.value !== 'polling') void start()
  }
  return {
    start,
    requestPoll,
    stop,
    onVisibility: makeOnVisibility(c, requestPoll),
    phase: c.phase,
  }
}
