import { defineStore } from 'pinia'
import { createRunsState } from './runs-state'

export type { RunLog, RunLogList } from '@/validation/schemas/run-log'

/** Pinia store for the comms run-history feed. */
export const useRunsStore = defineStore('comms-runs', () => {
  const s = createRunsState()

  /** Load runs once if not already loaded. */
  const ensureLoaded = async (): Promise<void> => {
    await (s.loaded.value ? Promise.resolve() : s.load())
  }

  return { ...s, ensureLoaded }
})
