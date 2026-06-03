import { defineStore } from 'pinia'
import { createCommsState } from './comms-state'

export type { Lang, Subscriber } from '@/validation/schemas/subscriber'

/** Pinia store for the newsletter (comms) admin surface. */
export const useCommsStore = defineStore('comms', () => {
  const s = createCommsState()

  /** Load subscribers once if not already loaded. */
  const ensureLoaded = async (): Promise<void> => {
    await (s.loaded.value ? Promise.resolve() : s.load())
  }

  return { ...s, ensureLoaded }
})
