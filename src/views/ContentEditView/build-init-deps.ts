import { createInitAll } from './create-init-all'
import type { useEditPage } from './useEditPage'
import { createInitEditor } from './useEditPageInit'

type Page = ReturnType<typeof useEditPage>

/**
 * Build the init-all function from page state.
 * @param page - Edit page state
 * @returns Async init function
 */
export const buildInitAll = (page: Page) => {
  const { editor, list, langs, assets, isBlog } = page
  const initEditor = createInitEditor({
    ...editor,
    loadContent: list.loadContent,
    availableLanguages: langs,
    buildPath: page.buildPath,
  })
  return createInitAll({
    initEditor,
    isBlog,
    frontmatterData: editor.frontmatterData,
    coverPath: assets.coverPath,
    loadAssets: assets.loadAssets,
  })
}
