import { computed } from 'vue'
import type { useContentList } from '@/composables/useContent/useContentList'
import { contentFile } from '@/config/content-paths'
import { useAuthStore } from '@/stores/auth'
import type { ContentType, Language } from '@/types/content'
import { NESTED_TYPES } from '@/types/content'
import { getAvailableLanguages } from '@/utils/available-languages'

type List = ReturnType<typeof useContentList>

/**
 * Create computed properties for content edit page.
 * @param validType - Validated content type
 * @param slug - Content slug
 * @param list - Content list composable instance
 * @returns Computed refs and path builder
 */
export const createPageComputeds = (
  validType: ContentType,
  slug: string,
  list: List
) => ({
  isAuth: computed(() => !!useAuthStore().user),
  contentType: computed(() => validType),
  hasAssets: computed(() => NESTED_TYPES.has(validType)),
  hasCover: computed(
    () =>
      validType === 'blog' ||
      validType === 'positions' ||
      validType === 'newspaper'
  ),
  isBlog: computed(() => validType === 'blog'),
  langs: computed(() => getAvailableLanguages(list.items.value, slug)),
  buildPath: (lang: Language) => contentFile(validType, slug, lang),
})
