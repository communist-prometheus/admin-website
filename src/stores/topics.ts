import { defineStore } from 'pinia'
import { createTopicsState } from './topics-state'

export type { TopicEntry } from '@/validation/schemas/topics'

/** Pinia store for editorial topic management. */
export const useTopicsStore = defineStore('topics', () => {
  const s = createTopicsState()

  /** Load topics if not already loaded. */
  const ensureLoaded = async (): Promise<void> => {
    await (s.loaded.value ? Promise.resolve() : s.loadTopics())
  }

  return { ...s, ensureLoaded }
})
