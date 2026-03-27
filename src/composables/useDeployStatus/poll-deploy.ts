import type { Ref } from 'vue'
import { parseDeploy } from './parse-deploy'
import type { DeployInfo } from './types'

/**
 * Create a poll function that fetches deploy status.
 * @param info - Reactive deploy info to update
 * @param getSha - Getter for current tracked SHA
 * @param stop - Stop polling callback
 * @returns Async poll function
 */
export const createPoll =
  (info: Ref<DeployInfo>, getSha: () => string, stop: () => void) =>
  async () => {
    const res = await fetch(`/api/deploy?sha=${getSha()}`)
    if (!res.ok) {
      info.value = { stage: 'not-found' }
      return
    }
    info.value = parseDeploy(await res.json())
    const done =
      info.value.stage === 'success' || info.value.stage === 'failure'
    if (done) stop()
  }
