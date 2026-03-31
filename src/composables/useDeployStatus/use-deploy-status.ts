import { onUnmounted, ref } from 'vue'
import { createTracker } from './create-tracker'
import type { DeployInfo } from './types'

const idle: DeployInfo = { stage: 'idle' }

/**
 * Track deploy via GitHub Check Runs after save.
 * @returns Reactive info, track, and clear functions
 */
export const useDeployStatus = () => {
  const info = ref<DeployInfo>(idle)
  const { track, clear, stop } = createTracker(info, idle)
  onUnmounted(stop)
  return { info, track, clear }
}
