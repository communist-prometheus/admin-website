import { click, expectHidden, type Page } from '@prometheus/e2e-toolkit'
import { SLOW } from './realmode-page'

/**
 * Drive the editor's Preview → Save (→ optional publish-confirm)
 * chain. Returns once the action settles UI-side; the network-side
 * confirmation (HEAD advance) is the caller's responsibility.
 *
 * The publish-confirm dialog only appears when the save will make
 * the content live — `pages`/`common` always, other types only
 * when `frontmatter.published === true`. A draft blog post saves
 * straight through without a dialog, so the confirm step has to
 * be conditional. See `views/ContentEditView/will-publish.ts`.
 * @param page - Playwright page on the editor view
 */
export const saveAndConfirm = async (page: Page): Promise<void> => {
  await click(page, page.locator('[data-testid="preview-button"]'), SLOW)
  await click(page, page.locator('[data-testid="save-button"]'), SLOW)

  const dialog = page.locator('[data-testid="publish-dialog"]')
  /* `willPublish` is decided synchronously in the same tick as the
   * save click. A 1 s window is plenty for Vue to mount the
   * overlay; absence after that means the save is going through
   * the no-confirm path. */
  const confirmed = await dialog
    .waitFor({ state: 'visible', timeout: 1_000 })
    .then(() => true)
    .catch(() => false)
  if (!confirmed) return
  await click(page, page.locator('[data-testid="publish-confirm-btn"]'), SLOW)
  await expectHidden(page, dialog, SLOW)
}
