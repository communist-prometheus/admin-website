import { hasBodyEditor } from '@/components/MarkdownEditor/page-body-policy'
import { createInitAll } from './create-init-all'
import type { useEditPage } from './useEditPage'
import { createInitEditor } from './useEditPageInit'

type Page = ReturnType<typeof useEditPage>

/*
 * Some pages slugs (home, blog-listing, positions-listing) are
 * frontmatter-only landing pages: their body is never rendered. Wrap
 * the editor init so any body content from disk is cleared on entry,
 * making the next save commit a clean frontmatter-only file.
 */
const clearBodyless = (page: Page): void => {
  page.editor.bodyContent.value = hasBodyEditor(
    page.contentType.value,
    page.slug
  )
    ? page.editor.bodyContent.value
    : ''
}

const wrapBodyless = (page: Page, init: () => Promise<void>) => async () => {
  await init()
  clearBodyless(page)
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
