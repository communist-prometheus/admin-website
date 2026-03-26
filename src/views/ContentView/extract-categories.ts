import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import type { ContentItem } from '@/types/content'

/**
 * Extract category string from a content item.
 * @param item - Content item to extract category from
 * @returns Category string or undefined
 */
const categoryOf = (item: ContentItem): string | undefined => {
  const c = item.frontmatter.category
  return typeof c === 'string' ? c : undefined
}

/**
 * Computed list of unique blog categories.
 * @returns Reactive array of category strings
 */
export const useBlogCategories = () => {
  const store = useContentStore()
  return computed(() => {
    const cats = store.allItems
      .filter(i => i.path.startsWith('blog/'))
      .map(categoryOf)
      .filter((c): c is string => c !== undefined)
    return [...new Set(cats)]
  })
}
