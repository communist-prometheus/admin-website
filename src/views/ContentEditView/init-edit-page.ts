import { computed, inject } from 'vue'
import { DEPLOY_TRACK_KEY } from '@/composables/useDeployStatus/deploy-context'
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
  const track = inject(DEPLOY_TRACK_KEY, undefined)
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
    track,
  })
  setupLifecycle(page, initAll)

  return { handleSave }
}
