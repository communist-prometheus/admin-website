import { makeSchedule } from './loop-actions'
import type { LoopCtx } from './loop-types'
import { pendingDeploy } from './pending-deploy'
import type { PollContext } from './poll-types'

/**
 * Build the PollContext bound to a LoopCtx.
 * @param c - Loop context with mutable state
 * @returns Poll context for runTick
 */
export const buildPollCtx = (c: LoopCtx): PollContext => {
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
    hasPendingDeploy: () => !!pendingDeploy.value,
  }
  schedule = makeSchedule(c, poll)
  return poll
}
