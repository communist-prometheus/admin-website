import type { Ref } from 'vue'
import type {
  Schedule,
  ScheduleWithNext,
} from '@/validation/schemas/schedule'
import { apiGetSchedule, apiPutSchedule } from './schedule-api'

/** Mutable refs the schedule action factories read + write. */
export type ScheduleRefs = {
  readonly schedule: Ref<ScheduleWithNext | undefined>
  readonly loading: Ref<boolean>
  readonly loaded: Ref<boolean>
  readonly saving: Ref<boolean>
  readonly error: Ref<string | undefined>
}

/**
 * Build the `load` action that pulls the schedule from the worker.
 * @param r Reactive refs the action mutates.
 * @returns Async action returning void.
 */
export const createLoadSchedule =
  (r: ScheduleRefs) => async (): Promise<void> => {
    r.loading.value = true
    r.error.value = undefined
    try {
      r.schedule.value = await apiGetSchedule()
      r.loaded.value = true
    } catch (e) {
      r.error.value =
        e instanceof Error ? e.message : 'Failed to load schedule'
    } finally {
      r.loading.value = false
    }
  }

/**
 * Build the `save` action that PUTs a new schedule and refreshes state.
 * @param r Reactive refs the action mutates.
 * @returns Async action returning void.
 */
export const createSaveSchedule =
  (r: ScheduleRefs) =>
  async (next: Schedule): Promise<void> => {
    r.saving.value = true
    r.error.value = undefined
    try {
      r.schedule.value = await apiPutSchedule(next)
    } catch (e) {
      r.error.value =
        e instanceof Error ? e.message : 'Failed to save schedule'
      throw e
    } finally {
      r.saving.value = false
    }
  }
