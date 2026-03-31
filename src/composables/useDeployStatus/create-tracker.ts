import type { Ref } from 'vue'
import { createCheckRunPoll } from './poll-check-run'
import { makeClear, makeTrack } from './tracker-actions'
import type { DeployInfo } from './types'

/**
 * Create track and clear functions for deploy status.
 * @param info - Reactive deploy info ref
 * @param idle - Idle state constant
 * @returns track, clear, and stop functions
 */
export const createTracker = (info: Ref<DeployInfo>, idle: DeployInfo) => {
  const s = {
    timer: undefined as ReturnType<typeof setInterval> | undefined,
    sha: '',
  }
  const stop = () => {
    clearInterval(s.timer)
    s.timer = undefined
  }
  const poll = createCheckRunPoll(
    info,
    () => s.sha,
    v => {
      s.sha = v
    },
    stop
  )
  return {
    track: makeTrack(s, info, stop, poll),
    clear: makeClear(info, stop, idle),
    stop,
  }
}
