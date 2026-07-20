import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

test.describe('offline watcher (3.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForSWControl(page)
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
