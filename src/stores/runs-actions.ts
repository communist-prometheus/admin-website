import type { Ref } from 'vue'
import type { RunLog } from '@/validation/schemas/run-log'
import { apiListRuns } from './runs-api'

/** Reactive refs the runs-state factories read + write. */
export type RunsRefs = {
  readonly runs: Ref<readonly RunLog[]>
  readonly loading: Ref<boolean>
  readonly loaded: Ref<boolean>
  readonly error: Ref<string | undefined>
}

/**
 * Build the `load` action that pulls the most-recent run-history rows
 * from the worker and surfaces a readable error on failure.
 * @param r Reactive refs the action mutates.
 * @returns Async action returning void.
 */
export const createLoadRuns =
  (r: RunsRefs) =>
  async (limit?: number): Promise<void> => {
    r.loading.value = true
    r.error.value = undefined
    try {
      const res = await apiListRuns(limit)
      r.runs.value = [...res.runs]
      r.loaded.value = true
    } catch (e) {
      r.error.value = e instanceof Error ? e.message : 'Failed to load runs'
    } finally {
      r.loading.value = false
    }
  }
