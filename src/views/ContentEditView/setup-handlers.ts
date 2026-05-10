import type { Ref } from 'vue'
import { buildRenameDeps } from './build-rename-deps'
import type { useEditPage } from './useEditPage'
import { makeRename, makeSwitchLang, makeUpdaters } from './wire-handlers'

type Page = ReturnType<typeof useEditPage>

interface HandlerDeps {
  readonly type: string
  readonly slug: string
  readonly previewing: Ref<boolean>
  readonly saveError: Ref<string | null>
}

const buildPreviewToggles = (previewing: Ref<boolean>) => ({
  enterPreview: (): void => {
    previewing.value = true
  },
  exitPreview: (): void => {
    previewing.value = false
  },
})

/**
 * Build the closures the SFC's template binds to. Extracted so the
 * SFC stays under the per-file LOC budget — each handler is trivial
 * but inlining all of them blows past sonar's `max-lines: 50` for
 * the .vue file.
 *
 * @param page - Edit page state from `useEditPage`
 * @param deps - Type/slug + the local `previewing` and `saveError` refs
 * @returns Handler closures used by the template
 */
export const setupEditHandlers = (page: Page, deps: HandlerDeps) => ({
  ...makeUpdaters(page.editor.bodyContent, page.editor.frontmatterData),
  ...buildPreviewToggles(deps.previewing),
  handleSwitchLang: makeSwitchLang({
    langs: page.langs,
    switchLanguage: page.editor.switchLanguage,
    buildPath: page.buildPath,
  }),
  handleRename: makeRename(
    deps.type,
    deps.slug,
    buildRenameDeps(page, deps.slug)
  ),
  setError: (msg: string): void => {
    deps.saveError.value = msg
  },
})
