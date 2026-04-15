import { computed, onMounted, onUnmounted } from 'vue'
import { createLoop, POLL_INTERVAL_MS } from './create-loop'
import { createDeployState } from './deploy-state'
import type { LoopHandle } from './loop-types'
import { jobsAreFinal } from './workflow-constants'

const hasDocument = typeof globalThis.document !== 'undefined'

const wireLifecycle = (loop: LoopHandle): void => {
  onMounted(() => {
    void loop.start()
    if (hasDocument)
      globalThis.document.addEventListener(
        'visibilitychange',
        loop.onVisibility
      )
  })
  onUnmounted(() => {
    loop.stop()
    if (hasDocument)
      globalThis.document.removeEventListener(
        'visibilitychange',
        loop.onVisibility
      )
  })
}

/**
 * Unified deploy polling composable. Single loop with a three-phase
 * machine: `idle | polling | paused`. Pauses when every visible run
 * is terminal or when the tab is hidden; resumes via `requestPoll()`
 * (save button) or visibility change.
 * @returns Reactive entries + requestPoll to resume after a save
 */
export const useDeployPolling = () => {
  const state = createDeployState()
  const loop = createLoop(state)
  wireLifecycle(loop)
  const hasActive = computed(() =>
    state.entries.value.some(
      e => e.run.status !== 'completed' || !jobsAreFinal(e.jobs)
    )
  )
  return {
    entries: state.entries,
    loading: state.loading,
    error: state.error,
    hasActive,
    phase: loop.phase,
    requestPoll: loop.requestPoll,
    refresh: loop.requestPoll,
  }
}

export { POLL_INTERVAL_MS }
