import { computed, type Ref, ref, toValue } from 'vue'
import { isTypePath } from '@/config/content-paths'
import { useContentStore } from '@/stores/content'
import type { ContentItem, ContentType } from '@/types/content'

/**
 * Content list composable — reads from the global store.
 * @param contentType - Type of content to list
 * @returns Content list interface
 */
export const useContentList = (
  contentType: ContentType | Ref<ContentType>
) => {
  const store = useContentStore()

  const items = computed(() =>
    store.allItems.filter(item => isTypePath(item.path, toValue(contentType)))
  )

  return {
    items,
    selectedItem: ref<ContentItem | null>(null),
    loadingList: computed(() => store.loading),
    loadContent: () => store.ensureLoaded(),
    reloadContent: () => store.loadAll(),
  }
}
