import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import type { useGitHubApi } from '../../useGitHubApi'
import { applyLoadedFile } from './apply-loaded-file'
import type { EditorDraft, MultiLangEditorState } from './types'

type GetFileFn = ReturnType<typeof useGitHubApi>['getFile']

/**
 * Creates a function that loads a file into the editor
 * @param getFile - API function to fetch file content
 * @param cache - Draft cache map
 * @param originalCache - Original draft cache for clean state
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @returns Async function that loads a file by path
 */
export const createLoadLanguageVersion =
  (
    getFile: GetFileFn,
    cache: Map<Language, EditorDraft>,
    originalCache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: Ref<string>
  ) =>
  async (path: string): Promise<void> => {
    state.loadingFile.value = true
    try {
      const file = await getFile(path)
      applyLoadedFile(file, cache, originalCache, state, fileSha)
    } finally {
      state.loadingFile.value = false
    }
  }
