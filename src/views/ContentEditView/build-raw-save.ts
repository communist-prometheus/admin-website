import { computed } from 'vue'
import type { TrackDeploy } from '@/composables/useDeployStatus/deploy-context'
import { createHandleSave } from './create-handle-save'
import type { useEditPage } from './useEditPage'

type Page = ReturnType<typeof useEditPage>

/**
 * Assemble the raw save closure from page dependencies.
 * Split out of init-edit-page so that file stays within the sonar
 * max-lines budget.
 * @param page - Edit page state from useEditPage
 * @param track - Optional resume-polling callback
 * @returns Raw save function (no state wrapping)
 */
export const buildRawSave = (
  page: Page,
  track: TrackDeploy | undefined
): (() => Promise<void>) => {
  const { editor, hasAssets, list, slug } = page
  const title = computed(() =>
    String(editor.frontmatterData.value.title ?? slug)
  )
  return createHandleSave({
    hasAssets,
    blogSave: page.blogSave,
    buildPath: page.buildPath,
    currentLang: editor.currentLang,
    saveCurrentLanguage: editor.saveCurrentLanguage,
    reloadContent: list.reloadContent,
    title,
    contentTypeName: page.contentType,
    track,
  })
}
