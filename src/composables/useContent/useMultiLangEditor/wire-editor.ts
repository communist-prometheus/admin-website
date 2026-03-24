import type { useGitHubApi } from '../../useGitHubApi'
import { buildEditorReturn } from './build-return'
import { createIsDirty } from './dirty-check'
import { createLoadLanguageVersion } from './load-language'
import type { EditorContext } from './state'

type Api = ReturnType<typeof useGitHubApi>

/**
 * Wire all editor operations from editor context.
 * @param ctx - Editor context with state and caches
 * @param getFile - GitHub API getFile function
 * @param update - GitHub API update function
 * @returns Fully wired editor interface
 */
export const wireEditor = (
  ctx: EditorContext,
  getFile: Api['getFile'],
  update: Api['update']
) => {
  const { cache, originalCache, fileSha, saveVersion, state } = ctx
  const loadLang = createLoadLanguageVersion(
    getFile,
    cache,
    originalCache,
    state,
    fileSha
  )
  const isDirty = createIsDirty(
    cache,
    originalCache,
    state,
    fileSha,
    saveVersion
  )
  state.isDirty = isDirty
  return buildEditorReturn(ctx, loadLang, isDirty, update)
}
