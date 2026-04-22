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
