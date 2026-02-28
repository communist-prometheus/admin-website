import { type Ref, ref, toValue } from 'vue'
import type { ContentItem, ContentType } from '@/types/content'

/**
 * Content list management composable
 * @param contentType - Type of content to list
 * @returns Content list interface
 */
export const useContentList = (
  contentType: ContentType | Ref<ContentType>
) => {
  const items = ref<readonly ContentItem[]>([])
  const selectedItem = ref<ContentItem | null>(null)

  const loadContent = async () => {
    const type = toValue(contentType)
    const response = await fetch(`/api/github/content/${type}`)
    if (!response.ok) {
      throw new Error(`Failed to load content: ${response.statusText}`)
    }

    const data = await response.json()
    items.value = (data.items || []).map((item: ContentItem) => ({
      path: item.path,
      slug: item.slug,
      lang: item.frontmatter.lang,
      frontmatter: item.frontmatter,
    }))
  }

  return {
    items,
    selectedItem,
    loadContent,
  }
}
