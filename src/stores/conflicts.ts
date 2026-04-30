import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearConflict,
  loadConflict,
  saveConflict,
} from './conflicts-storage'
import type { ConflictRecord } from './conflicts-types'

export type { ConflictRecord } from './conflicts-types'

/**
 * Build the reactive state for the conflicts store. Persists to
 * `localStorage` so the conflict survives reload until resolved.
 * @returns Bound state ref + actions.
 */
const createConflictsState = () => {
  const current = ref<ConflictRecord | undefined>(loadConflict())
  const hasConflict = computed(() => current.value !== undefined)
  return {
    current,
    hasConflict,
    record: (next: ConflictRecord): void => {
      current.value = next
      saveConflict(next)
    },
    clear: (): void => {
      current.value = undefined
      clearConflict()
    },
  }
}

/** Pinia store backing the persisted conflict record. */
export const useConflictsStore = defineStore('conflicts', () =>
  createConflictsState()
)
