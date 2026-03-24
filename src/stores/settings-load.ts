import type { Ref } from 'vue'
import type { LanguageEntry } from '@/validation/schemas/languages'
import { fetchLanguagesFile, parseLanguages } from './settings-api'

/**
 * Create loader that fetches and parses languages.
 * @param languages - Reactive languages ref
 * @param fileSha - Reactive file SHA ref
 * @param loading - Reactive loading ref
 * @param loaded - Reactive loaded ref
 * @returns Async function that loads languages
 */
export const createLoadLanguages =
  (
    languages: Ref<readonly LanguageEntry[]>,
    fileSha: Ref<string>,
    loading: Ref<boolean>,
    loaded: Ref<boolean>
  ) =>
  async (): Promise<void> => {
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
