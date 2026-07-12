import type { Ref } from 'vue'
import type { RunLog } from '@/validation/schemas/run-log'
import { apiListRuns, RUNS_PAGE_SIZE } from './runs-api'

/** Reactive refs the runs-state factories read + write. */
export type RunsRefs = {
  readonly runs: Ref<readonly RunLog[]>
  readonly loading: Ref<boolean>
  readonly loaded: Ref<boolean>
  readonly error: Ref<string | undefined>
  /** False once a page comes back short — nothing older is left. */
  readonly hasMore: Ref<boolean>
}

const message = (e: unknown): string =>
  e instanceof Error ? e.message : 'Failed to load runs'

/**
 * Build the `load` action that pulls the newest page of run-history rows
 * from the worker, replacing whatever is held.
 * @param r Reactive refs the action mutates.
 * @returns Async action returning void.
 */
export const createLoadRuns =
  (r: RunsRefs) =>
  async (limit: number = RUNS_PAGE_SIZE): Promise<void> => {
    r.loading.value = true
    r.error.value = undefined
    try {
      const res = await apiListRuns(limit)
      r.runs.value = Object.freeze([...res.runs])
      r.hasMore.value = res.runs.length === limit
      r.loaded.value = true
    } catch (e) {
      r.error.value = message(e)
    } finally {
      r.loading.value = false
    }
  }

const appendPage = async (r: RunsRefs, pageSize: number): Promise<void> => {
  r.loading.value = true
  r.error.value = undefined
  try {
    const res = await apiListRuns(pageSize, r.runs.value.length)
    r.runs.value = Object.freeze([...r.runs.value, ...res.runs])
    r.hasMore.value = res.runs.length === pageSize
  } catch (e) {
    r.error.value = message(e)
  } finally {
    r.loading.value = false
  }
}

/**
 * Build the `loadMore` action that appends the next page. The log holds
 * one row per recipient per tick, so a single run is already hundreds of
 * rows — paging is how the editor walks back through history instead of
 * seeing a truncated slice of the latest run. A no-op while a load is in
 * flight or once the log has no older rows left.
 * @param r Reactive refs the action mutates.
 * @returns Async action returning void.
 */
export const createLoadMoreRuns =
  (r: RunsRefs) =>
  async (pageSize: number = RUNS_PAGE_SIZE): Promise<void> => {
    const busy = r.loading.value || !r.hasMore.value
    await (busy ? Promise.resolve() : appendPage(r, pageSize))
  }
