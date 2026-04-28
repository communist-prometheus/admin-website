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
 */
const seedFromCurrent = (
  state: MultiLangEditorState,
  lang: Language,
  fileSha: Ref<string>
): void => {
  const previous = state.frontmatterData.value
  state.frontmatterData.value = { ...previous, lang }
  state.bodyContent.value = ''
  fileSha.value = ''
}

/**
 * Creates a function that switches language with cache
 * @param cache - Draft cache map
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @param loadFn - Function to load a file by path
 * @returns Async function to switch language
 */
export const createSwitchLanguage =
  (
    cache: Map<Language, EditorDraft>,
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
    seedFromCurrent(state, lang, fileSha)
  }
