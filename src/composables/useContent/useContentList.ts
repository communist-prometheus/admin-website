import { ref } from 'vue'
import type { ContentItem, ContentType } from '@/types/content'

export const useContentList = (contentType: ContentType) => {
  const items = ref<readonly ContentItem[]>([])
  const selectedItem = ref<ContentItem | null>(null)

  const loadContent = async () => {
    const response = await fetch(`/api/github/content/${contentType}`)
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
