import { defineStore } from 'pinia'
import { createLinksState } from './links-state'

export type { LinkEntry } from '@/validation/schemas/links'

/** Pinia store for the curated links directory (settings/links.json). */
export const useLinksStore = defineStore('links', () => {
  const s = createLinksState()

  /** Load links once if not already loaded. */
  const ensureLoaded = async () => {
    await (s.loaded.value ? Promise.resolve() : s.loadLinks())
  }

  return { ...s, ensureLoaded }
})
