import type { Ref } from 'vue'
import type { DeployInfo } from './types'

const POLL_MS = 8000

interface TrackerState {
  timer: ReturnType<typeof setInterval> | undefined
  sha: string
}

/**
 * Create track action that starts polling.
 * @param s - Mutable timer state
 * @param info - Reactive deploy info
 * @param stop - Stop function
 * @param poll - Poll function
 * @returns Track function
 */
export const makeTrack =
  (
    s: TrackerState,
    info: Ref<DeployInfo>,
    stop: () => void,
    poll: () => Promise<void>
  ) =>
  () => {
    stop()
    s.sha = ''
    info.value = { stage: 'building' }
    s.timer = setInterval(poll, POLL_MS)
  }

/**
 * Create clear action that resets to idle.
 * @param info - Reactive deploy info
 * @param stop - Stop function
 * @param idle - Idle state
 * @returns Clear function
 */
export const makeClear =
  (info: Ref<DeployInfo>, stop: () => void, idle: DeployInfo) => () => {
    stop()
    info.value = idle
  }
