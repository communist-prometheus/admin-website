import { expect, test } from '@playwright/test'

test.describe('trace overlay (5.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible', timeout: 15_000 })
  })

  test('Ctrl+Shift+T toggles the overlay', async ({ page }) => {
    const overlay = page.locator('[data-testid="trace-overlay"]')
    await expect(overlay).toBeHidden()
    await page.keyboard.press('Control+Shift+T')
    await expect(overlay).toBeVisible()
    await page.keyboard.press('Control+Shift+T')
    await expect(overlay).toBeHidden()
  })

  test('close button hides the overlay', async ({ page }) => {
    await page.keyboard.press('Control+Shift+T')
    const overlay = page.locator('[data-testid="trace-overlay"]')
    await expect(overlay).toBeVisible()
    await page.locator('[data-testid="trace-overlay-close"]').click()
    await expect(overlay).toBeHidden()
  })

  test('shows empty state when no spans recorded', async ({ page }) => {
    await page.keyboard.press('Control+Shift+T')
    await expect(
      page.locator('[data-testid="trace-overlay-empty"]')
    ).toBeVisible()
  })
})
