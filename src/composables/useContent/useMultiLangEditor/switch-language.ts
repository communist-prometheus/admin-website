import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import { snapshotAndSwitch, tryRestoreCached } from './switch-helpers'
import type { EditorDraft, MultiLangEditorState } from './types'

/*
 * Frontmatter is an entity-level property — every language version of
 * the same content shares title/description/category/etc. Only `lang`
 * differs per file, and the body is independent. When the user
 * switches to a language that has no file yet (and no prior draft in
 * cache), seed the new draft with the previous frontmatter (with lang
 * updated) and an empty body. Wiping frontmatter to {} here would make
 * the next Save fail with "category is missing" / "title is missing".
 *
 * Seeding ALSO writes the same snapshot into originalCache so isDirty
 * reports the freshly-switched draft as clean — the user has not
 * edited anything yet, so the unsaved-changes guard must not fire.
 */
const seedFromCurrent = (
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  state: MultiLangEditorState,
  lang: Language,
  fileSha: Ref<string>
): void => {
  const previous = state.frontmatterData.value
  const seeded = { ...previous, lang }
  state.frontmatterData.value = seeded
  state.bodyContent.value = ''
  fileSha.value = ''
  const draft: EditorDraft = {
    frontmatter: { ...seeded },
    body: '',
    sha: '',
    loaded: true,
  }
  cache.set(lang, draft)
  originalCache.set(lang, { ...draft, frontmatter: { ...seeded } })
}

/**
 * Creates a function that switches language with cache
 * @param cache - Draft cache map
 * @param originalCache - Original cache map for clean-state comparison
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @param loadFn - Function to load a file by path
 * @returns Async function to switch language
 */
export const createSwitchLanguage =
  (
    cache: Map<Language, EditorDraft>,
    originalCache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: Ref<string>,
    loadFn: (path: string) => Promise<void>
  ) =>
  async (lang: Language, path?: string): Promise<void> => {
    snapshotAndSwitch(cache, state, fileSha, lang)
    if (tryRestoreCached(cache, lang, state, fileSha)) return
    if (path) {
      await loadFn(path)
      return
    }
    seedFromCurrent(cache, originalCache, state, lang, fileSha)
  }
