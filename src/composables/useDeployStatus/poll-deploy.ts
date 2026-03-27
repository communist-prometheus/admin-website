import type { Ref } from 'vue'
import type { DeployInfo } from './types'

/**
 * Create a poll function that checks for new version.
 * @param info - Reactive deploy info to update
 * @param getAfter - Getter for version number to compare
 * @param stop - Stop polling callback
 * @returns Async poll function
 */
export const createPoll =
  (info: Ref<DeployInfo>, getAfter: () => number, stop: () => void) =>
  async () => {
    const r = await fetch(`/api/deploy?after=${getAfter()}`)
    if (!r.ok) {
      info.value = { stage: 'not-found' }
      return
    }
    const d: { isNew: boolean; version: number; createdOn: string } =
      await r.json()
    info.value = d.isNew
      ? { stage: 'success', version: d.version, createdOn: d.createdOn }
      : { stage: 'building', version: d.version }
    if (d.isNew) stop()
  }
