import type { Ref } from 'vue'
import type { LanguageEntry } from '@/validation/schemas/languages'
import { saveLanguagesFile } from './settings-api'

/**
 * Create updater that saves languages to the API.
 * @param languages - Reactive languages ref
 * @param fileSha - Reactive file SHA ref
 * @returns Async function that updates languages
 */
export const createUpdateLanguages =
  (languages: Ref<readonly LanguageEntry[]>, fileSha: Ref<string>) =>
  async (entries: readonly LanguageEntry[]): Promise<boolean> => {
    const res = await saveLanguagesFile(entries, fileSha.value)
    if (res.ok) {
      languages.value = entries
      const data = await res.json()
      fileSha.value = data.content?.sha ?? fileSha.value
    }
    return res.ok
  }
