import type { useGitHubApi } from '../../useGitHubApi'
import { createMarkSaved } from './mark-saved'
import { createSaveCurrentLanguage } from './save-language'
import type { EditorContext } from './state'
import { createReset } from './state'
import { createSwitchLanguage } from './switch-language'

type LoadLangFn = (path: string) => Promise<void>
type UpdateFn = ReturnType<typeof useGitHubApi>['update']

/**
 * Build save-related editor actions from context.
 * @param ctx - Editor context
 * @param update - GitHub update function
 * @returns Save and mark-saved functions
 */
export const buildSaveActions = (ctx: EditorContext, update: UpdateFn) => ({
  saveCurrentLanguage: createSaveCurrentLanguage(
    update,
    ctx.cache,
    ctx.state,
    ctx.fileSha,
    ctx.originalCache,
    ctx.saveVersion
  ),
  markSaved: createMarkSaved(
    ctx.cache,
    ctx.originalCache,
    ctx.state,
    ctx.fileSha,
    ctx.saveVersion
  ),
})

/**
 * Build navigation editor actions from context.
 * @param ctx - Editor context
 * @param loadLang - Language loader function
 * @param langScopedFields - Frontmatter keys to drop when seeding
 *   a fresh-language draft
 * @returns Switch and reset functions
 */
export const buildNavActions = (
  ctx: EditorContext,
  loadLang: LoadLangFn,
  langScopedFields: readonly string[] = []
) => ({
  switchLanguage: createSwitchLanguage(
    ctx.cache,
    ctx.originalCache,
    ctx.state,
    ctx.fileSha,
    loadLang,
    langScopedFields
  ),
  reset: createReset(ctx.cache, ctx.originalCache, ctx.state, ctx.fileSha),
})
