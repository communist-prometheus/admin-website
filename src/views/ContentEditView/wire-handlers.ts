import type { Ref } from 'vue'
import type { CreateContentData } from '@/components/CreateContentDialog/helpers'
import { setNewContentDraft } from '@/composables/useContent/new-content-draft'
import { renameContent } from '@/composables/useGitHubApi/rename-content'
import type { Language } from '@/types/content'

interface SwitchDeps {
  readonly langs: { readonly value: ReadonlySet<Language> }
  readonly switchLanguage: (lang: Language, path?: string) => void
  readonly buildPath: (lang: Language) => string
}

interface RenameDeps {
  readonly isUnsaved: () => boolean
  readonly currentDraft?: () => CreateContentData | undefined
  readonly navigate?: (url: string) => void
}

const defaultNavigate = (url: string): void => {
  globalThis.location.replace(url)
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
 * Persist a rename via the SW API (when the content already exists
 * on disk) or do a local-only rename (re-stash the draft + navigate)
 * when the user renames a freshly-created entity that hasn't been
 * saved yet. The local-only branch fixes the create→rename→save
 * regression where the SW would 404 on a slug that has no files
 * committed in the working branch.
 *
 * @param type content type (e.g. 'blog', 'magazine')
 * @param oldSlug the slug being renamed
 * @param deps `isUnsaved` (langs.value.size === 0 in the page),
 *   optional `currentDraft` builder for the local-rename fallback,
 *   optional `navigate` for testing
 * @returns a function that performs the rename
 */
export const makeRename =
  (type: string, oldSlug: string, deps: RenameDeps) =>
  async (newSlug: string): Promise<void> => {
    const navigate = deps.navigate ?? defaultNavigate
    const targetUrl = `/content/${type}/edit/${newSlug}`
    if (deps.isUnsaved()) {
      const draft = deps.currentDraft?.()
      if (draft) setNewContentDraft({ ...draft, slug: newSlug })
      navigate(targetUrl)
      return
    }
    await renameContent(type, oldSlug, newSlug)
    navigate(targetUrl)
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
