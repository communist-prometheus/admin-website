import { onUnmounted, ref } from 'vue'
import { fetchCurrentVersion } from './fetch-current'
import { createPoll } from './poll-deploy'
import type { DeployInfo } from './types'

const POLL_MS = 10000
const idle: DeployInfo = { stage: 'idle' }

/**
 * Poll for new CF Workers version after save.
 * @returns Reactive info, track, and clear functions
 */
export const useDeployStatus = () => {
  const info = ref<DeployInfo>(idle)
  let timer: ReturnType<typeof setInterval> | undefined
  let after = 0
  const stop = () => {
    if (timer) clearInterval(timer)
    timer = undefined
  }
  const poll = createPoll(info, () => after, stop)
  const track = async () => {
    stop()
    after = await fetchCurrentVersion()
    info.value = { stage: 'building' }
    timer = setInterval(poll, POLL_MS)
  }
  const clear = () => {
    stop()
    info.value = idle
  }
  onUnmounted(stop)
  return { info, track, clear }
}
