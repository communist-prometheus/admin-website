import type { Ref } from 'vue'
import type { ResolveStrategy } from '@/sw/protocol/push-control'
import { clearConflict, saveConflict } from './conflicts-storage'
import type { ConflictRecord } from './conflicts-types'

/**
 * Build the async actions bound to the conflicts store refs.
 * Persists the conflict event to localStorage and tracks
 * per-file resolution choices in memory until finalize.
 * @param current Reactive ref of the current conflict record.
 * @param resolutions Reactive ref of the resolutions map.
 * @returns Object exposing record / setResolution / clear.
 */
export const createConflictActions = (
  current: Ref<ConflictRecord | undefined>,
  resolutions: Ref<Map<string, ResolveStrategy>>
) => ({
  record: (next: ConflictRecord): void => {
    current.value = next
    resolutions.value = new Map()
    saveConflict(next)
  },
  setResolution: (file: string, strategy: ResolveStrategy): void => {
    const map = new Map(resolutions.value)
    map.set(file, strategy)
    resolutions.value = map
  },
  clear: (): void => {
    current.value = undefined
    resolutions.value = new Map()
    clearConflict()
  },
})
