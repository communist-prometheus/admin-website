import type { Language } from '@/types/content'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Snapshots current editor state into the cache
 * @param cache - Draft cache map
 * @param lang - Language key
 * @param frontmatter - Current frontmatter data
 * @param body - Current body content
 * @param sha - File SHA
 */
export const snapshotDraft = (
  cache: Map<Language, EditorDraft>,
  lang: Language,
  frontmatter: Record<string, unknown>,
  body: string,
  sha: string
): void => {
  const existing = cache.get(lang)
  cache.set(lang, {
    frontmatter: { ...frontmatter },
    body,
    sha: existing?.sha ?? sha,
    loaded: true,
  })
}

/**
 * Restores a cached draft into the editor state
 * @param draft - Cached draft to restore
 * @param state - Editor state to update
 */
export const restoreFromCache = (
  draft: EditorDraft,
  state: MultiLangEditorState
): void => {
  state.frontmatterData.value = { ...draft.frontmatter }
  state.bodyContent.value = draft.body
}
