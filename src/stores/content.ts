import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { ContentItem, ContentType } from '@/types/content'

const CONTENT_TYPES: readonly ContentType[] = ['blog', 'pages', 'positions']

const fetchContentItems = async (
  type: ContentType
): Promise<readonly ContentItem[]> => {
  if (typeof globalThis.document === 'undefined') return []
  const response = await fetch(`/api/github/content/${type}`)
  if (!response.ok) {
    throw new Error(`Failed to load content: ${response.statusText}`)
  }
  const data = await response.json()
  return ((data.items || []) as readonly ContentItem[]).map(
    (item: ContentItem): ContentItem => ({
      path: item.path,
      slug: item.slug,
      lang: item.frontmatter.lang,
      frontmatter: item.frontmatter,
    })
  )
}

/**
 * Global content store — loaded once on auth, consumed by all views
 */
export const useContentStore = defineStore('content', () => {
  const allItems = ref<readonly ContentItem[]>([])
  const loading = ref(false)

  const loadAll = async () => {
    loading.value = true
    try {
      const results = await Promise.all(CONTENT_TYPES.map(fetchContentItems))
      allItems.value = results.flat()
    } finally {
      loading.value = false
    }
  }

  const itemsByType = (type: ContentType) =>
    computed(() =>
      allItems.value.filter(item =>
        item.path.startsWith(`src/content/${type}/`)
      )
    )

  return { allItems, loading, loadAll, itemsByType }
})
