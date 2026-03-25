import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import { parseFrontmatter } from '@/utils/frontmatter/parse'
import { setLoadedDraft } from './set-loaded-draft'
import type { EditorDraft, MultiLangEditorState } from './types'

interface FileData {
  readonly content: string
  readonly sha: string
}

/**
 * Apply a loaded file to the editor state and caches.
 * @param file - Raw file data with content and SHA
 * @param cache - Draft cache map
 * @param originalCache - Original draft cache for clean state
 * @param state - Editor state
 * @param fileSha - File SHA ref
 */
export const applyLoadedFile = (
  file: FileData,
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  state: MultiLangEditorState,
  fileSha: Ref<string>
): void => {
  const parsed = parseFrontmatter(file.content)
  state.frontmatterData.value = { ...parsed.frontmatter }
  state.bodyContent.value = parsed.content
  fileSha.value = file.sha
  setLoadedDraft(
    cache,
    originalCache,
    state.currentLang.value,
    parsed.frontmatter,
    parsed.content,
    file.sha
  )
}
