import { computed, type Ref, ref, toValue } from 'vue'
import { useContentStore } from '@/stores/content'
import type { ContentItem, ContentType } from '@/types/content'

const matchesType = (item: ContentItem, type: ContentType): boolean =>
  item.path.startsWith(`src/content/${type}/`)

/**
 * Content list composable — reads from the global content store
 * @param contentType - Type of content to list
 * @returns Content list interface
 */
export const useContentList = (
  contentType: ContentType | Ref<ContentType>
) => {
  const store = useContentStore()

  const items = computed(() =>
    store.allItems.filter(item => matchesType(item, toValue(contentType)))
  )

  const selectedItem = ref<ContentItem | null>(null)

  const loadContent = async () => {
    await store.ensureLoaded()
  }

  const reloadContent = async () => {
    await store.loadAll()
  }

  return {
    items,
    selectedItem,
    loadingList: computed(() => store.loading),
    loadContent,
    reloadContent,
  }
}
