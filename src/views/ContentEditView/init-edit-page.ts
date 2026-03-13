import { buildInitAll } from './build-init-deps'
import { createHandleSave } from './create-handle-save'
import { setupLifecycle } from './setup-lifecycle'
import type { useEditPage } from './useEditPage'

type Page = ReturnType<typeof useEditPage>

/**
 * Set up mount/watch hooks and save handler.
 * @param page - Edit page state from useEditPage
 * @returns Save handler
 */
export const initEditPage = (page: Page) => {
  const { editor, isBlog, list } = page
  const initAll = buildInitAll(page)
  const handleSave = createHandleSave({
    isBlog,
    blogSave: page.blogSave,
    buildPath: page.buildPath,
    currentLang: editor.currentLang,
    saveCurrentLanguage: editor.saveCurrentLanguage,
    loadContent: list.loadContent,
  })
  setupLifecycle(page, initAll)

  return { handleSave }
}
