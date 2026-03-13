import type { ComputedRef, Ref } from 'vue'
import type { Language } from '@/types/content'

interface HandleSaveDeps {
  readonly isBlog: ComputedRef<boolean>
  readonly blogSave: (message: string) => Promise<void>
  readonly buildPath: (lang: Language) => string
  readonly currentLang: Ref<Language>
  readonly saveCurrentLanguage: (
    path: string,
    message: string
  ) => Promise<void>
  readonly loadContent: () => Promise<void>
}

/**
 * Create the save handler for edit page.
 * @param deps - Dependencies for saving
 * @returns Async save handler
 */
export const createHandleSave =
  (deps: HandleSaveDeps) => async (message: string) => {
    if (deps.isBlog.value) await deps.blogSave(message)
    else {
      const path = deps.buildPath(deps.currentLang.value)
      await deps.saveCurrentLanguage(path, message)
    }
    await deps.loadContent()
  }
