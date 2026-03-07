import type { ComputedRef, Ref } from 'vue'
import type { Language } from '@/types/content'

interface InitDeps {
  readonly reset: () => void
  readonly loadContent: () => Promise<void>
  readonly availableLanguages: ComputedRef<ReadonlySet<Language>>
  readonly currentLang: Ref<Language>
  readonly loadLanguageVersion: (path: string) => Promise<void>
  readonly buildPath: (lang: Language) => string
}

/**
 * Creates an editor initialization function
 * @param deps - Dependencies for initialization
 * @returns Async function to initialize the editor
 */
export const createInitEditor =
  (deps: InitDeps) => async (): Promise<void> => {
    deps.reset()
    await deps.loadContent()
    const firstLang = deps.availableLanguages.value.has('en')
      ? 'en'
      : ([...deps.availableLanguages.value][0] ?? 'en')
    deps.currentLang.value = firstLang
    if (deps.availableLanguages.value.has(firstLang)) {
      await deps.loadLanguageVersion(deps.buildPath(firstLang))
    }
  }
