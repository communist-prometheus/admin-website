import type { Ref } from 'vue'
import type { ContentItem } from '@/types/content'
import { CONTENT_TYPES, fetchContentItems } from './content-fetch'

/**
 * Create loader that fetches all content types.
 * @param allItems - Reactive items ref
 * @param loading - Reactive loading ref
 * @param loaded - Reactive loaded ref
 * @returns Async function that loads all content
 */
export const createLoadAll =
  (
    allItems: Ref<readonly ContentItem[]>,
    loading: Ref<boolean>,
    loaded: Ref<boolean>
  ) =>
  async (): Promise<void> => {
    loading.value = true
    try {
      const results = await Promise.all(CONTENT_TYPES.map(fetchContentItems))
      allItems.value = results.flat()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }
