import type { Router } from 'vue-router'
import type { ContentItem, ContentType } from '@/types/content'

/**
 * Create navigation handler for item selection.
 * @param router - Vue Router instance
 * @param contentType - Content type
 * @returns Select handler function
 */
export const createSelectHandler =
  (router: Router, contentType: ContentType) =>
  (item: ContentItem): void => {
    router.push({
      name: 'content-edit',
      params: { type: contentType, slug: item.slug },
    })
  }
