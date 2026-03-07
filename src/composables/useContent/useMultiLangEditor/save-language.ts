import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import { stringifyFrontmatter } from '@/utils/frontmatter/stringify'
import type { useGitHubApi } from '../../useGitHubApi'
import type { EditorDraft, MultiLangEditorState } from './types'

type UpdateFn = ReturnType<typeof useGitHubApi>['update']

/**
 * Creates a function that saves the current language version
 * @param update - API function to update file
 * @param cache - Draft cache map
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @param originalCache - Original draft cache for clean state
 * @returns Async function that saves by path and message
 */
export const createSaveCurrentLanguage =
  (
    update: UpdateFn,
    cache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: Ref<string>,
    originalCache: Map<Language, EditorDraft>
  ) =>
  async (path: string, message: string): Promise<void> => {
    const fullContent = stringifyFrontmatter(
      state.frontmatterData.value,
      state.bodyContent.value
    )
    await update(path, fullContent, message, fileSha.value)
    const draft: EditorDraft = {
      frontmatter: { ...state.frontmatterData.value },
      body: state.bodyContent.value,
      sha: fileSha.value,
      loaded: true,
    }
    const lang = state.currentLang.value
    cache.set(lang, draft)
    originalCache.set(lang, { ...draft })
  }
