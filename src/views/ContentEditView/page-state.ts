import { computed } from 'vue'
import { useAssets } from '@/composables/useAssets/useAssets'
import { useContentList } from '@/composables/useContent/useContentList'
import { useMultiLangEditor } from '@/composables/useContent/useMultiLangEditor'
import { contentFile } from '@/config/content-paths'
import { useAuthStore } from '@/stores/auth'
import type { Language } from '@/types/content'
import { isContentType, NESTED_TYPES } from '@/types/content'
import { getAvailableLanguages } from '@/utils/available-languages'
import { createAssetHandlers } from './asset-handlers'

/**
 * Validate and narrow the type string to ContentType.
 * @param type - Content type string from route params
 * @returns Validated ContentType
 * @throws Error if the type is not a valid ContentType
 */
const validateContentType = (type: string) => {
  if (!isContentType(type)) {
    throw new Error(`Invalid content type: ${type}`)
  }
  return type
}

/**
 * Create core reactive state for content edit page.
 * @param type - Content type string
 * @param slug - Content slug
 * @returns Core page state and helpers
 */
export const createPageState = (type: string, slug: string) => {
  const validType = validateContentType(type)
  const isAuth = computed(() => !!useAuthStore().user)
  const contentType = computed(() => validType)
  const hasAssets = computed(() => NESTED_TYPES.has(contentType.value))
  const isBlog = computed(() => contentType.value === 'blog')
  const list = useContentList(contentType)
  const editor = useMultiLangEditor()
  const assets = useAssets(type, slug, undefined)
  const ah = createAssetHandlers(assets)
  const langs = computed(() => getAvailableLanguages(list.items.value, slug))
  const buildPath = (lang: Language) => contentFile(validType, slug, lang)

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
