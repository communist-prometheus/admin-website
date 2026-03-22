import { computed } from 'vue'
import { useAssets } from '@/composables/useAssets/useAssets'
import { useContentList } from '@/composables/useContent/useContentList'
import { useMultiLangEditor } from '@/composables/useContent/useMultiLangEditor'
import { useAuthStore } from '@/stores/auth'
import { contentFile } from '@/config/content-paths'
import type { ContentType, Language } from '@/types/content'
import { NESTED_TYPES } from '@/types/content'
import { getAvailableLanguages } from '@/utils/available-languages'
import { createAssetHandlers } from './asset-handlers'

/**
 * Create core reactive state for content edit page.
 * @param type - Content type string
 * @param slug - Content slug
 * @returns Core page state and helpers
 */
export const createPageState = (type: string, slug: string) => {
  const isAuth = computed(() => !!useAuthStore().user)
  const contentType = computed(() => type as ContentType)
  const hasAssets = computed(() => NESTED_TYPES.has(contentType.value))
  const isBlog = computed(() => contentType.value === 'blog')
  const list = useContentList(contentType)
  const editor = useMultiLangEditor()
  const assets = useAssets(type, slug, undefined)
  const ah = createAssetHandlers(assets)
  const langs = computed(() => getAvailableLanguages(list.items.value, slug))
  const buildPath = (lang: Language) =>
    contentFile(type as ContentType, slug, lang)

  return {
    slug,
    isAuth,
    contentType,
    isBlog,
    hasAssets,
    list,
    editor,
    assets,
    ah,
    langs,
    buildPath,
  }
}
