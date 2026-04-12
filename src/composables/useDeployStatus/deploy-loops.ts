import { doFastPoll, doSlowPoll } from './deploy-poll'
import type { DeployState } from './deploy-state'

/** Fast poll interval (ms) used when any build is still active. */
export const POLL_FAST = 1000
/** Slow poll interval (ms) used when all builds are idle. */
export const POLL_SLOW = 15000
/** Slow loop recurrence interval (ms) for in-flight job detail updates. */
export const SLOW_POLL_INTERVAL = 2000
/** Initial delay (ms) before the slow loop starts after mount. */
export const SLOW_POLL_INITIAL_DELAY = 1500

/** Handle returned by setTimeout, stored for cleanup. */
export type Timer = ReturnType<typeof setTimeout> | undefined

/**
 * Build a self-scheduling fast poll loop.
 * @param state - Deploy state
 * @param nextDelay - Delay resolver invoked after each tick
 * @param setTimer - Timer setter for cleanup
 * @returns Async loop function
 */
export const createFastLoop = (
  state: DeployState,
  nextDelay: () => number,
  setTimer: (t: Timer) => void
) => {
  let running = false
  const loop = async () => {
    if (running) return
    running = true
    await doFastPoll(state)
    running = false
    setTimer(setTimeout(loop, nextDelay()))
  }
  return loop
}

/**
 * Build a self-scheduling slow poll loop for detailed job updates.
 * @param state - Deploy state
 * @param setTimer - Timer setter for cleanup
 * @returns Async loop function
 */
export const createSlowLoop = (
  state: DeployState,
  setTimer: (t: Timer) => void
) => {
  const loop = async () => {
    await doSlowPoll(state)
    setTimer(setTimeout(loop, SLOW_POLL_INTERVAL))
  }
  return loop
}
