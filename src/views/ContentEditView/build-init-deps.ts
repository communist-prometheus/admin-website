import { hasBodyEditor } from '@/components/MarkdownEditor/page-body-policy'
import { createInitAll } from './create-init-all'
import type { useEditPage } from './useEditPage'
import { createInitEditor } from './useEditPageInit'

type Page = ReturnType<typeof useEditPage>

/*
 * For entries whose public-website template does not render a body
 * (magazine, common, the frontmatter-only `pages` slugs), drop any
 * body content loaded from disk AND realign both caches so isDirty
 * reports clean post-init. Without realigning, the unsaved-changes
 * guard would fire on first navigation because draft.body='' would
 * not match originalCache.body=<loaded>.
 */
const applyBodylessReset = (page: Page): void => {
  page.editor.bodyContent.value = ''
  page.editor.markSaved()
}

const wrapBodyless = (page: Page, init: () => Promise<void>) => async () => {
  await init()
  const showBody = hasBodyEditor(page.contentType.value, page.slug)
  return showBody ? undefined : applyBodylessReset(page)
}

/**
 * Build the init-all function from page state.
 * @param page - Edit page state
 * @returns Async init function
 */
export const buildInitAll = (page: Page) => {
  const { editor, list, langs, assets, hasAssets } = page
  const initEditor = wrapBodyless(
    page,
    createInitEditor({
      ...editor,
      loadContent: list.loadContent,
      availableLanguages: langs,
      buildPath: page.buildPath,
    })
  )
  return createInitAll({
    initEditor,
    hasAssets,
    frontmatterData: editor.frontmatterData,
    coverPath: assets.coverPath,
    loadAssets: assets.loadAssets,
  })
}
