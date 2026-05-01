import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'

/*
 * Once `context.setOffline(true)` flips, the request graph stops
 * settling — heartbeats fire, fail, fire again. Toolkit waits that
 * gate on idle would hang. Use raw Playwright `expect` for the
 * offline-state assertions; its retries don't depend on network.
 */
test.describe('settings offline gate (3.4)', () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, '/settings')
    await expectVisible(page, page.locator('[data-testid="members-section"]'))
  })

  test('offline disables invite + shows banner', async ({
    page,
    context,
  }) => {
    const banner = page.locator('[data-testid="members-offline-banner"]')
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
