import { expect, test } from '@playwright/test'

test.describe('settings offline gate (3.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await page
      .locator('[data-testid="members-section"]')
      .waitFor({ state: 'visible' })
  })

  test('offline disables invite + shows banner', async ({
    page,
    context,
  }) => {
    const banner = page.locator(
      '[data-testid="members-offline-banner"]'
    )
    await expect(banner).toBeHidden()
    await context.setOffline(true)
    await expect(banner).toBeVisible()
    const invite = page.locator('[data-testid="invite-open"]')
    await expect(invite).toBeDisabled()
  })

  test('reconnect re-enables actions', async ({ page, context }) => {
    await context.setOffline(true)
    const invite = page.locator('[data-testid="invite-open"]')
    await expect(invite).toBeDisabled()
    await context.setOffline(false)
    await expect(invite).toBeEnabled()
  })
})
