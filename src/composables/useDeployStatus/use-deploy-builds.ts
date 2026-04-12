import { computed, onMounted, onUnmounted } from 'vue'
import {
  createFastLoop,
  createSlowLoop,
  POLL_FAST,
  POLL_SLOW,
  SLOW_POLL_INITIAL_DELAY,
  type Timer,
} from './deploy-loops'
import { createDeployState, type DeployState } from './deploy-state'
import { jobsAreFinal } from './workflow-constants'

const createHasActive = (state: DeployState) =>
  computed(() =>
    state.entries.value.some(
      e =>
        e.run.status !== 'completed' || !jobsAreFinal(state.store[e.run.id])
    )
  )

/**
 * Poll GitHub Actions workflow runs and jobs.
 * Fast polling (1s) when builds are active, slow (15s) when idle.
 * @returns Reactive builds, loading state, and refresh function
 */
export const useDeployBuilds = () => {
  const state = createDeployState()
  const hasActive = createHasActive(state)
  let fastTimer: Timer
  let slowTimer: Timer
  const fastLoop = createFastLoop(
    state,
    () => (hasActive.value ? POLL_FAST : POLL_SLOW),
    t => {
      fastTimer = t
    }
  )
  const slowLoop = createSlowLoop(state, t => {
    slowTimer = t
  })
  onMounted(() => {
    fastLoop()
    slowTimer = setTimeout(slowLoop, SLOW_POLL_INITIAL_DELAY)
  })
  onUnmounted(() => {
    if (fastTimer) clearTimeout(fastTimer)
    if (slowTimer) clearTimeout(slowTimer)
  })
  return { ...state, hasActive, refresh: fastLoop }
}
