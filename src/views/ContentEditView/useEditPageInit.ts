import type { ComputedRef, Ref } from 'vue'
import { consumeNewContentDraft } from '@/composables/useContent/new-content-draft'
import type { Language } from '@/types/content'

interface InitDeps {
  readonly reset: () => void
  readonly loadContent: () => Promise<void>
  readonly availableLanguages: ComputedRef<ReadonlySet<Language>>
  readonly currentLang: Ref<Language>
  readonly loadLanguageVersion: (path: string) => Promise<void>
  readonly buildPath: (lang: Language) => string
  readonly frontmatterData: Ref<Record<string, unknown>>
  readonly bodyContent: Ref<string>
}

const pickFirstLang = (available: ReadonlySet<Language>): Language =>
  available.has('en') ? 'en' : ([...available][0] ?? 'en')

/**
 * Creates an editor initialization function.
 *
 * Always calls `loadLanguageVersion`, even when the store's
 * availableLanguages set is empty for the current slug. This handles
 * the create→edit transition: the SW has just written the new file
 * to its virtual FS, but the global content store (pinia) has not
 * refreshed yet, so `availableLanguages` still returns an empty set.
 * Skipping the load in that case leaves the editor with empty
 * frontmatter, so the next save silently wipes all frontmatter.
 * @param deps - Dependencies for initialization
 * @returns Async function to initialize the editor
 */
export const createInitEditor =
  (deps: InitDeps) => async (): Promise<void> => {
    deps.reset()

    const draft = consumeNewContentDraft()
    if (draft) {
      deps.currentLang.value = draft.lang
      deps.frontmatterData.value = {
        title: draft.title,
        lang: draft.lang,
        ...(draft.description ? { description: draft.description } : {}),
        ...(draft.category ? { category: draft.category } : {}),
      }
      deps.bodyContent.value = ''
      return
    }

    await deps.loadContent()
    const firstLang = pickFirstLang(deps.availableLanguages.value)
    deps.currentLang.value = firstLang
    await deps.loadLanguageVersion(deps.buildPath(firstLang))
  }
