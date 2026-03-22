import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { swFetch } from '@/composables/useSWBridge/sw-fetch'

export interface LanguageEntry {
  readonly code: string
  readonly label: string
}

const LANGUAGES_PATH = 'settings/languages.json'

const fetchLanguages = async (): Promise<readonly LanguageEntry[]> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(LANGUAGES_PATH)}`
  )
  if (!res.ok) return []
  const data = await res.json()
  try {
    return JSON.parse(data.content) as readonly LanguageEntry[]
  } catch {
    return []
  }
}

const saveLanguages = async (
  languages: readonly LanguageEntry[]
): Promise<boolean> => {
  const content = JSON.stringify(languages, null, 2) + '\n'
  const res = await swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: LANGUAGES_PATH,
      content,
      message: 'Update languages configuration',
    }),
  })
  return res.ok
}

export const useSettingsStore = defineStore('settings', () => {
  const languages = ref<readonly LanguageEntry[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const languageCodes = computed(() => languages.value.map((l) => l.code))

  const loadLanguages = async () => {
    loading.value = true
    try {
      languages.value = await fetchLanguages()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (!loaded.value) await loadLanguages()
  }

  const updateLanguages = async (entries: readonly LanguageEntry[]) => {
    const ok = await saveLanguages(entries)
    if (ok) languages.value = entries
    return ok
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
