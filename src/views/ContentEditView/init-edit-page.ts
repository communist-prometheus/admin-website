import { computed } from 'vue'
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
  const { editor, hasAssets, list, slug } = page
  const initAll = buildInitAll(page)
  const handleSave = createHandleSave({
    hasAssets,
    blogSave: page.blogSave,
    buildPath: page.buildPath,
    currentLang: editor.currentLang,
    saveCurrentLanguage: editor.saveCurrentLanguage,
    reloadContent: list.reloadContent,
    title: computed(() => String(editor.frontmatterData.value.title ?? slug)),
    contentTypeName: page.contentType,
  })
  setupLifecycle(page, initAll)

  return { handleSave }
}
