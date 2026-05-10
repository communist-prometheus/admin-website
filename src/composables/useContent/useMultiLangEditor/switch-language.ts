import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import { seedFromCurrent } from './seed-from-current'
import { snapshotAndSwitch, tryRestoreCached } from './switch-helpers'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Creates a function that switches language with cache.
 * @param cache - Draft cache map
 * @param originalCache - Original cache map for clean-state comparison
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @param loadFn - Function to load a file by path
 * @param langScopedFields - Frontmatter keys to drop when seeding
 *   a draft for a brand-new lang (default empty)
 * @returns Async function to switch language
 */
export const createSwitchLanguage =
  (
    cache: Map<Language, EditorDraft>,
    originalCache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: Ref<string>,
    loadFn: (path: string) => Promise<void>,
    langScopedFields: readonly string[] = []
  ) =>
  async (lang: Language, path?: string): Promise<void> => {
    snapshotAndSwitch(cache, state, fileSha, lang)
    if (tryRestoreCached(cache, lang, state, fileSha)) return
    if (path) {
      await loadFn(path)
      return
    }
    seedFromCurrent(
      cache,
      originalCache,
      state,
      lang,
      fileSha,
      langScopedFields
    )
  }
