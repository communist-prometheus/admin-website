import { useGitHubApi } from '../useGitHubApi'
import { createEditorState } from './useMultiLangEditor/state'
import { wireEditor } from './useMultiLangEditor/wire-editor'

/** Options affecting per-language seeding behaviour. */
export interface MultiLangEditorOptions {
  /**
   * Frontmatter keys that are scoped to a single language and
   * MUST NOT be carried over when seeding a fresh draft after the
   * user clicks a dimmed lang tab. For newspaper, `image` is
   * per-lang (each translation has its own cover); for blog or
   * positions the cover is entity-level and stays shared.
   */
  readonly langScopedFields?: readonly string[]
}

/**
 * Multi-language editor composable with per-language
 * draft cache
 * @param options - Optional per-type tweaks (see MultiLangEditorOptions)
 * @returns Multi-language editor interface
 */
export const useMultiLangEditor = (options: MultiLangEditorOptions = {}) => {
  const { getFile, update } = useGitHubApi()
  const ctx = createEditorState()
  return wireEditor(ctx, getFile, update, options.langScopedFields ?? [])
}
