import type { ComputedRef, Ref } from 'vue'
import type { TrackDeploy } from '@/composables/useDeployStatus/deploy-context'
import { setPendingDeploy } from '@/composables/useDeployStatus/pending-deploy'
import type { Language } from '@/types/content'

interface HandleSaveDeps {
  readonly hasAssets: ComputedRef<boolean>
  readonly blogSave: (message: string) => Promise<void>
  readonly buildPath: (lang: Language) => string
  readonly currentLang: Ref<Language>
  readonly saveCurrentLanguage: (
    path: string,
    message: string
  ) => Promise<void>
  readonly reloadContent: () => Promise<void>
  readonly title: ComputedRef<string>
  readonly contentTypeName: ComputedRef<string>
  readonly track?: TrackDeploy
}

/**
 * Create the save handler for edit page.
 * @param deps - Dependencies for saving
 * @returns Async save handler
 */
export const createHandleSave = (deps: HandleSaveDeps) => async () => {
  const message = `updated ${deps.title.value} in ${deps.contentTypeName.value}`
  if (deps.hasAssets.value) await deps.blogSave(message)
  else {
    const path = deps.buildPath(deps.currentLang.value)
    await deps.saveCurrentLanguage(path, message)
  }
  setPendingDeploy(message)
  deps.track?.()
  await deps.reloadContent()
}
