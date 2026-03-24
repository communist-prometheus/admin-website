import { defineStore } from 'pinia'
import { createSettingsState } from './settings-state'

export type { LanguageEntry } from '@/validation/schemas/languages'

/** Pinia store for application language settings. */
export const useSettingsStore = defineStore('settings', () => {
  const s = createSettingsState()

  /** Load languages if not already loaded. */
  const ensureLoaded = async () => {
    if (!s.loaded.value) await s.loadLanguages()
  }

  return { ...s, ensureLoaded }
})
