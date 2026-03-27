import { onUnmounted, ref } from 'vue'
import { createPoll } from './poll-deploy'
import type { DeployInfo } from './types'

const POLL_MS = 5000
const idle: DeployInfo = { stage: 'idle' }

/**
 * Poll deployment status for a commit SHA.
 * Starts on track(sha), stops on terminal state.
 * @returns Reactive info, track, and clear functions
 */
export const useDeployStatus = () => {
  const info = ref<DeployInfo>(idle)
  let timer: ReturnType<typeof setInterval> | undefined
  let sha = ''

  const stop = () => {
    if (timer) clearInterval(timer)
    timer = undefined
  }

  const poll = createPoll(info, () => sha, stop)

  const track = (s: string) => {
    stop()
    sha = s
    info.value = { stage: 'queued' }
    poll()
    timer = setInterval(poll, POLL_MS)
  }

  const clear = () => {
    stop()
    info.value = idle
  }

  onUnmounted(stop)
  return { info, track, clear }
}
