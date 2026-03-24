import { useGitHubApi } from '../useGitHubApi'
import { createEditorState } from './useMultiLangEditor/state'
import { wireEditor } from './useMultiLangEditor/wire-editor'

/**
 * Multi-language editor composable with per-language
 * draft cache
 * @returns Multi-language editor interface
 */
export const useMultiLangEditor = () => {
  const { getFile, update } = useGitHubApi()
  const ctx = createEditorState()
  return wireEditor(ctx, getFile, update)
}
