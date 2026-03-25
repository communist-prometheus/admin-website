import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isTypePath } from '@/config/content-paths'
import type { ContentItem, ContentType } from '@/types/content'
import { createLoadAll } from './content-load-all'

/**
 * Global content store — loaded once on auth,
 * consumed by all views
 */
export const useContentStore = defineStore('content', () => {
  const allItems = ref<readonly ContentItem[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const loadAll = createLoadAll(allItems, loading, loaded)
  const ensureLoaded = async () => {
    if (!loaded.value) await loadAll()
  }
  const itemsByType = (type: ContentType) =>
    computed(() => allItems.value.filter(item => isTypePath(item.path, type)))

  return { allItems, loading, loaded, loadAll, ensureLoaded, itemsByType }
})
