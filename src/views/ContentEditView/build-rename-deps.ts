import type { CreateContentData } from '@/components/CreateContentDialog/helpers'
import type { useEditPage } from './useEditPage'

type Page = ReturnType<typeof useEditPage>

const stringField = (
  fm: Record<string, unknown>,
  key: string
): string | undefined => {
  const v = fm[key]
  return typeof v === 'string' && v.length > 0 ? v : undefined
}

/**
 * Build the dependency object passed to `makeRename`. Surfaces the
 * "is this content already on disk?" probe (langs.size === 0 means
 * the user hit `+ New` but never saved) and the in-flight draft
 * builder so a local-only rename can re-stash the draft under the
 * new slug.
 * @param page - Edit page state from useEditPage
 * @param currentSlug - Current slug being renamed
 * @returns Rename dependencies for `makeRename`
 */
export const buildRenameDeps = (page: Page, currentSlug: string) => ({
  isUnsaved: (): boolean => page.langs.value.size === 0,
  currentDraft: (): CreateContentData => {
    const fm = page.editor.frontmatterData.value
    const description = stringField(fm, 'description')
    const category = stringField(fm, 'category')
    return {
      slug: currentSlug,
      lang: page.editor.currentLang.value,
      title: stringField(fm, 'title') ?? '',
      ...(description ? { description } : {}),
      ...(category ? { category } : {}),
    }
  },
})
