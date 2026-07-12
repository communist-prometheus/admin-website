import type { Locator, Page } from '@playwright/test'

/**
 * Click the editor's Preview button and return the Save button that
 * appears on the preview page.
 *
 * Replaces the former "click save-button directly" flow introduced by
 * issue #14 (Preview-before-save).
 *
 * @param page the Playwright Page
 * @returns a Locator pointing at the Save button on the preview
 */
export const openPreview = async (page: Page): Promise<Locator> => {
  await page.locator('[data-testid="preview-button"]').click()
  return page.locator('[data-testid="save-button"]')
}

/**
 * Save + auto-confirm the publish dialog when it appears.
 *
 * Issue #15 introduced a confirmation dialog that fires when saving
 * will publish to the live site (pages/common always, blog/positions/
 * magazine only when `published: true`). Tests that just want to
 * exercise the save pipeline should wait for the dialog and click
 * Confirm, or proceed if no dialog shows (draft content).
 *
 * @param page the Playwright Page
 * @param saveBtn the Save button returned by openPreview
 */
export const saveAndConfirm = async (
  page: Page,
  saveBtn: Locator
): Promise<void> => {
  await saveBtn.click()
  const confirm = page.locator('[data-testid="publish-confirm-btn"]')
  await confirm
    .waitFor({ state: 'visible', timeout: 1000 })
    .catch(() => undefined)
  if (await confirm.isVisible()) await confirm.click()
}
