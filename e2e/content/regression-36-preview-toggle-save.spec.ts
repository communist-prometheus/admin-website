import {
  click,
  expectCount,
  expectVisible,
  test,
} from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

/**
 * Regression for issue #36.
 *
 * The editor used to surface TWO buttons labeled "Preview":
 *   1. `[data-testid="preview-toggle"]` — at the top of the editor body
 *      (the eye icon inside `MarkdownEditorBody.vue`).
 *   2. `[data-testid="preview-button"]` — at the bottom of the editor
 *      (the page-level Preview in `EditorFooter.vue`).
 *
 * Only the bottom button entered the global preview mode that exposes
 * the Save button. Users saw "Preview" at the top, clicked it, expected
 * to land in the save flow, but instead got an in-editor render with
 * no Save button — and had to scroll down and click the OTHER "Preview"
 * to actually save.
 *
 * Fix: the redundant in-editor preview-toggle is removed. There is one
 * "Preview" entry point on the edit page, and it goes straight to the
 * save flow.
 */
test.describe('Issue #36 — single "Preview" entry leads to Save', () => {
  test('the redundant in-editor preview-toggle is gone', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('pages', 'manifest')
    await expectCount(page, page.locator('[data-testid="preview-toggle"]'), 0)
  })

  test('the only Preview button reveals Save', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('pages', 'manifest')
    await click(page, page.locator('[data-testid="preview-button"]'))
    await expectVisible(page, page.locator('[data-testid="save-button"]'))
  })
})
