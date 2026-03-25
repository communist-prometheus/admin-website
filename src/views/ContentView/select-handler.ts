import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import type { ContentItem, ContentType } from '@/types/content'

/**
 * Create navigation handler for item selection.
 * @param router - Vue Router instance
 * @param contentType - Reactive content type
 * @returns Select handler function
 */
export const createSelectHandler =
  (router: Router, contentType: Ref<ContentType>) =>
  (item: ContentItem): void => {
    router.push({
      name: 'content-edit',
      params: { type: contentType.value, slug: item.slug },
    })
  }
