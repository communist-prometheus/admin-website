import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchLanguagesFile,
  parseLanguages,
  saveLanguagesFile,
} from './settings-api'

/** Language entry with code and display label. */
export interface LanguageEntry {
  readonly code: string
  readonly label: string
}

/** Pinia store for application language settings. */
export const useSettingsStore = defineStore('settings', () => {
  const languages = ref<readonly LanguageEntry[]>([])
  const fileSha = ref('')
  const loading = ref(false)
  const loaded = ref(false)
  const languageCodes = computed(() => languages.value.map(l => l.code))

  const loadLanguages = async () => {
    loading.value = true
    try {
      const file = await fetchLanguagesFile()
      if (file) {
        languages.value = parseLanguages(file.content)
        fileSha.value = file.sha
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (!loaded.value) await loadLanguages()
  }

  const updateLanguages = async (entries: readonly LanguageEntry[]) => {
    const res = await saveLanguagesFile(entries, fileSha.value)
    if (res.ok) {
      languages.value = entries
      const data = await res.json()
      fileSha.value = data.content?.sha ?? fileSha.value
    }
    return res.ok
  }

  return {
    languages,
    languageCodes,
    loading,
    loaded,
    loadLanguages,
    ensureLoaded,
    updateLanguages,
  }
})
