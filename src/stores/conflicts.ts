import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ResolveStrategy } from '@/sw/protocol/push-control'
import { createConflictActions } from './conflicts-actions'
import { loadConflict } from './conflicts-storage'
import type { ConflictRecord } from './conflicts-types'

export type { ConflictRecord } from './conflicts-types'

/**
 * Build the reactive state for the conflicts store. Persists the
 * conflict event to `localStorage` so it survives reload, and
 * tracks per-file resolution choices in memory until the user
 * finalizes them.
 * @returns Bound state ref + actions.
 */
const createConflictsState = () => {
  const current = ref<ConflictRecord | undefined>(loadConflict())
  const resolutions = ref(new Map<string, ResolveStrategy>())
  const hasConflict = computed(() => current.value !== undefined)
  const allResolved = computed(() => {
    const total = current.value?.files.length ?? 0
    return total > 0 && resolutions.value.size === total
  })
  const actions = createConflictActions(current, resolutions)
  return {
    current,
    resolutions,
    hasConflict,
    allResolved,
    ...actions,
  }
}

/** Pinia store backing the persisted conflict record. */
export const useConflictsStore = defineStore('conflicts', () =>
  createConflictsState()
)
