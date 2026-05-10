import { useAssets } from '@/composables/useAssets/useAssets'
import { useContentList } from '@/composables/useContent/useContentList'
import { useMultiLangEditor } from '@/composables/useContent/useMultiLangEditor'
import type { ContentType } from '@/types/content'
import { createAssetHandlers } from './asset-handlers'
import { createPageComputeds } from './page-computeds'
import { validateContentType } from './validate-type'

/* Frontmatter keys that should NOT carry over when the user
 * switches to a brand-new language file. Newspaper issues store the
 * cover per-lang (each translation publishes a different printed
 * issue with its own cover image), so `image` resets on switch. */
const langScopedByType: Partial<Record<ContentType, readonly string[]>> = {
  newspaper: ['image'],
}

/**
 * Create core reactive state for content edit page.
 * @param type - Content type string
 * @param slug - Content slug
 * @returns Core page state and helpers
 */
export const createPageState = (type: string, slug: string) => {
  const validType = validateContentType(type)
  const list = useContentList(validType)
  const editor = useMultiLangEditor({
    langScopedFields: langScopedByType[validType] ?? [],
  })
  const assets = useAssets(type, slug, undefined)

  return {
    slug,
    ...createPageComputeds(validType, slug, list),
    list,
    editor,
    assets,
    ah: createAssetHandlers(assets),
  }
}
