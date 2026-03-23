import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { swFetch } from '@/composables/useSWBridge/sw-fetch'

export interface LanguageEntry {
  readonly code: string
  readonly label: string
}

const LANGUAGES_PATH = 'settings/languages.json'

interface FileData {
  readonly content: string
  readonly sha: string
}

const fetchFile = async (): Promise<FileData | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(LANGUAGES_PATH)}`
  )
  if (!res.ok) return undefined
  return res.json() as Promise<FileData>
}

const parseLanguages = (content: string): readonly LanguageEntry[] => {
  try {
    return JSON.parse(content) as readonly LanguageEntry[]
  } catch {
    return []
  }
}

export const useSettingsStore = defineStore('settings', () => {
  const languages = ref<readonly LanguageEntry[]>([])
  const fileSha = ref('')
  const loading = ref(false)
  const loaded = ref(false)

  const languageCodes = computed(() => languages.value.map((l) => l.code))

  const loadLanguages = async () => {
    loading.value = true
    try {
      const file = await fetchFile()
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
    const content = JSON.stringify(entries, null, 2) + '\n'
    const res = await swFetch('/api/github/file', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: LANGUAGES_PATH,
        content,
        sha: fileSha.value,
        message: 'Update languages configuration',
      }),
    })
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
