import { useAssets } from '@/composables/useAssets/useAssets'
import { useContentList } from '@/composables/useContent/useContentList'
import { useMultiLangEditor } from '@/composables/useContent/useMultiLangEditor'
import { createAssetHandlers } from './asset-handlers'
import { createPageComputeds } from './page-computeds'
import { validateContentType } from './validate-type'

/**
 * Create core reactive state for content edit page.
 * @param type - Content type string
 * @param slug - Content slug
 * @returns Core page state and helpers
 */
export const createPageState = (type: string, slug: string) => {
  const validType = validateContentType(type)
  const list = useContentList(validType)
  const editor = useMultiLangEditor()
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
