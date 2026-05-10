import type { ComputedRef } from 'vue'
import type { useGitHubApi } from '../../useGitHubApi'
import { buildNavActions, buildSaveActions } from './build-actions'
import type { EditorContext } from './state'

type LoadLangFn = (path: string) => Promise<void>
type UpdateFn = ReturnType<typeof useGitHubApi>['update']

/**
 * Build the return value for the wired editor.
 * @param ctx - Editor context
 * @param loadLang - Language loader function
 * @param isDirty - Dirty state computed
 * @param update - GitHub update function
 * @param langScopedFields - Frontmatter keys excluded from seeding
 *   when switching to a brand-new lang
 * @returns Wired editor return object
 */
export const buildEditorReturn = (
  ctx: EditorContext,
  loadLang: LoadLangFn,
  isDirty: ComputedRef<boolean>,
  update: UpdateFn,
  langScopedFields: readonly string[] = []
) => ({
  ...ctx.state,
  isDirty,
  loadLanguageVersion: loadLang,
  ...buildSaveActions(ctx, update),
  ...buildNavActions(ctx, loadLang, langScopedFields),
})
