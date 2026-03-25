import { computed, ref } from 'vue'
import type { LanguageEntry } from '@/validation/schemas/languages'
import { createLoadLanguages } from './settings-load'
import { createUpdateLanguages } from './settings-update'

/**
 * Create the reactive state and actions for settings store.
 * @returns Store state, getters, and actions
 */
export const createSettingsState = () => {
  const languages = ref<readonly LanguageEntry[]>([])
  const fileSha = ref('')
  const loading = ref(false)
  const loaded = ref(false)
  const languageCodes = computed(() => languages.value.map(l => l.code))
  const loadLanguages = createLoadLanguages(
    languages,
    fileSha,
    loading,
    loaded
  )

  return {
    languages,
    languageCodes,
    loading,
    loaded,
    loadLanguages,
    updateLanguages: createUpdateLanguages(languages, fileSha),
  }
}
