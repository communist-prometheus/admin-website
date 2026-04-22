import type { Ref } from 'vue'
import { renameContent } from '@/composables/useGitHubApi/rename-content'
import type { Language } from '@/types/content'

interface SwitchDeps {
  readonly langs: { readonly value: ReadonlySet<Language> }
  readonly switchLanguage: (lang: Language, path?: string) => void
  readonly buildPath: (lang: Language) => string
}

/**
 * Switch to `lang`, loading the file only when the store says the
 * slug has a translation for that language.
 *
 * @param deps switch language callback + the current slug's langs ref
 * @returns a function that switches + loads
 */
export const makeSwitchLang =
  (deps: SwitchDeps) =>
  (lang: Language): void => {
    if (deps.langs.value.has(lang))
      deps.switchLanguage(lang, deps.buildPath(lang))
    else deps.switchLanguage(lang)
  }

/**
 * Persist a rename via the SW API and hard-reload to the new URL so
 * route state is clean.
 *
 * @param type content type (e.g. 'blog')
 * @param oldSlug the slug being renamed
 * @returns a function that performs the rename
 */
export const makeRename =
  (type: string, oldSlug: string) =>
  async (newSlug: string): Promise<void> => {
    await renameContent(type, oldSlug, newSlug)
    globalThis.location.replace(`/content/${type}/edit/${newSlug}`)
  }

/**
 * Body / frontmatter setters pointing at the editor refs.
 *
 * @param body textarea content ref
 * @param fm frontmatter record ref
 * @returns setters used by ContentEditView event handlers
 */
export const makeUpdaters = (
  body: Ref<string>,
  fm: Ref<Record<string, unknown>>
) => ({
  updateBody: (v: string): void => {
    body.value = v
  },
  updateFm: (d: Record<string, unknown>): void => {
    fm.value = d
  },
})
