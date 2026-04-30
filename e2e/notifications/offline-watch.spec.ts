import { expect, test } from '@playwright/test'

test.describe('offline watcher (3.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('going offline surfaces a network notification', async ({
    page,
    context,
  }) => {
    await context.setOffline(true)
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-kind', 'network')
    await expect(toast).toContainText(/offline|network/i)
  })

  test('online → offline → online does not double-fire', async ({
    page,
    context,
  }) => {
    await context.setOffline(true)
    await expect(
      page.locator('[data-testid="notification-toast"]')
    ).toHaveCount(1)
    await context.setOffline(false)
    await context.setOffline(true)
    await expect(
      page.locator('[data-testid="notification-toast"]')
    ).toHaveCount(2)
  })
})
