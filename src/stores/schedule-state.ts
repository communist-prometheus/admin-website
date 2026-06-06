import { ref } from 'vue'
import type { ScheduleWithNext } from '@/validation/schemas/schedule'
import {
  createLoadSchedule,
  createSaveSchedule,
  type ScheduleRefs,
} from './schedule-actions'

/**
 * Reactive state + actions for the newsletter dispatch schedule.
 * Mirrors the comms-state factory shape.
 * @returns Refs plus `load` and `save` actions.
 */
export const createScheduleState = () => {
  const r: ScheduleRefs = {
    schedule: ref<ScheduleWithNext | undefined>(undefined),
    loading: ref(false),
    loaded: ref(false),
    saving: ref(false),
    error: ref<string | undefined>(undefined),
  }
  return {
    ...r,
    load: createLoadSchedule(r),
    save: createSaveSchedule(r),
  }
}
