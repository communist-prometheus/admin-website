import { type Ref, ref } from 'vue'
import type { DeployState } from './deploy-state'
import {
  makeOnVisibility,
  makeSchedule,
  makeStart,
  makeStop,
} from './loop-actions'
import type { LoopCtx, LoopHandle } from './loop-types'
import type { Phase, PollContext } from './poll-types'

export type { LoopHandle } from './loop-types'
export { POLL_INTERVAL_MS } from './loop-types'

const WAIT_WINDOW_MS = 180_000

const buildCtx = (state: DeployState): LoopCtx => ({
  state,
  phase: ref<Phase>('idle') as Ref<Phase>,
  timer: undefined,
  waitingForRunUntil: 0,
})

const buildPollCtx = (c: LoopCtx): PollContext => {
  const setTimer = (t: typeof c.timer): void => {
    c.timer = t
  }
  let schedule: () => void = () => undefined
  const poll: PollContext = {
    state: c.state,
    phase: c.phase,
    setTimer,
    schedule: () => schedule(),
    isWaitingForRun: () => Date.now() < c.waitingForRunUntil,
  }
  schedule = makeSchedule(c, poll)
  return poll
}

/**
 * Build the poll loop bound to a reactive state.
 * @param state - Deploy state shared by the composable
 * @returns LoopHandle exposing start, stop, requestPoll
 */
export const createLoop = (state: DeployState): LoopHandle => {
  const c = buildCtx(state)
  const poll = buildPollCtx(c)
  const start = makeStart(c, poll)
  const stop = makeStop(c)
  const requestPoll = (): void => {
    c.waitingForRunUntil = Date.now() + WAIT_WINDOW_MS
    if (c.phase.value !== 'polling') void start()
  }
  const onVisibility = makeOnVisibility(c, requestPoll)
  return { start, requestPoll, stop, onVisibility, phase: c.phase }
}
