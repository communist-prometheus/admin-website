import type { Ref } from 'vue'
import type { LinkEntry } from '@/validation/schemas/links'
import { fetchLinksFile, parseLinksDoc } from './links-api'

/**
 * Create the loader that fetches and parses the links document.
 * @param entries - Reactive entries ref.
 * @param groups - Reactive group-order ref.
 * @param fileSha - Reactive file SHA ref.
 * @param loading - Reactive loading flag.
 * @param loaded - Reactive loaded flag.
 * @returns Async function that loads links into the refs.
 */
export const createLoadLinks =
  (
    entries: Ref<readonly LinkEntry[]>,
    groups: Ref<readonly string[]>,
    fileSha: Ref<string>,
    loading: Ref<boolean>,
    loaded: Ref<boolean>
  ) =>
  async (): Promise<void> => {
    loading.value = true
    try {
      const file = await fetchLinksFile()
      const doc = file ? parseLinksDoc(file.content) : undefined
      entries.value = doc?.entries ?? entries.value
      groups.value = doc?.groups ?? groups.value
      fileSha.value = file?.sha ?? fileSha.value
      loaded.value = true
    } finally {
      loading.value = false
    }
  }
