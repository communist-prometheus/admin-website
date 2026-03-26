import { defineStore } from 'pinia'
import { createLabelsState } from './labels-state'

export type { LabelEntry } from '@/validation/schemas/labels'

/** Pinia store for label management. */
export const useLabelsStore = defineStore('labels', () => {
  const s = createLabelsState()

  /** Load labels if not already loaded. */
  const ensureLoaded = async () => {
    if (!s.loaded.value) await s.loadLabels()
  }

  return { ...s, ensureLoaded }
})
