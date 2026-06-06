import { defineStore } from 'pinia'
import { createScheduleState } from './schedule-state'

export type {
  Schedule,
  ScheduleWithNext,
} from '@/validation/schemas/schedule'

/** Pinia store for the newsletter dispatch schedule. */
export const useScheduleStore = defineStore('comms-schedule', () => {
  const s = createScheduleState()

  /** Load the schedule once if not already loaded. */
  const ensureLoaded = async (): Promise<void> => {
    await (s.loaded.value ? Promise.resolve() : s.load())
  }

  return { ...s, ensureLoaded }
})
