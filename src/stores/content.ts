import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { isTypePath } from '@/config/content-paths'
import type { ContentItem, ContentType } from '@/types/content'

const CONTENT_TYPES: readonly ContentType[] = [
  'blog',
  'pages',
  'positions',
  'common',
]

/**
 * Fetch content items of a given type from the SW.
 * Waits for SW readiness before issuing the request.
 * @param type - Content type to fetch
 * @returns Array of content items
 */
const fetchContentItems = async (
  type: ContentType
): Promise<readonly ContentItem[]> => {
  if (typeof globalThis.document === 'undefined') return []
  const response = await swFetch(`/api/github/content/${type}`)
  if (!response.ok) {
    throw new Error(`Failed to load: ${response.statusText}`)
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
  const loaded = ref(false)

  const loadAll = async () => {
    loading.value = true
    try {
      const results = await Promise.all(CONTENT_TYPES.map(fetchContentItems))
      allItems.value = results.flat()
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (!loaded.value) await loadAll()
  }

  const itemsByType = (type: ContentType) =>
    computed(() => allItems.value.filter(item => isTypePath(item.path, type)))

  return { allItems, loading, loaded, loadAll, ensureLoaded, itemsByType }
})
