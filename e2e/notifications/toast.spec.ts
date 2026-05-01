import { expect, test } from '@prometheus/e2e-toolkit'

test.describe('notifications: toast + indicator (1.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('info toast appears, can be dismissed manually', async ({ page }) => {
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeHidden()
    await page.locator('[data-testid="notify-trigger-info"]').click()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('info')
    await toast.locator('[data-testid="notification-toast-dismiss"]').click()
    await expect(toast).toBeHidden()
  })

  test('error toast is sticky and exposes a dismiss control', async ({
    page,
  }) => {
    await page.locator('[data-testid="notify-trigger-error"]').click()
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-sticky', 'true')
    const dismiss = toast.locator(
      '[data-testid="notification-toast-dismiss"]'
    )
    await expect(dismiss).toHaveAttribute('aria-label', /dismiss/i)
    await dismiss.click()
    await expect(toast).toBeHidden()
  })

  test('indicator badge reflects the unread count', async ({ page }) => {
    const badge = page.locator('[data-testid="notification-indicator-badge"]')
    await expect(badge).toBeHidden()
    await page.locator('[data-testid="notify-trigger-info"]').click()
    await expect(badge).toHaveText('1')
    await page.locator('[data-testid="notify-trigger-error"]').click()
    await expect(badge).toHaveText('2')
  })

  test('only the most recent three toasts are visible', async ({ page }) => {
    const trigger = page.locator('[data-testid="notify-trigger-error"]')
    for (let i = 0; i < 5; i += 1) {
      await trigger.click()
    }
    const visible = page.locator('[data-testid="notification-toast"]')
    await expect(visible).toHaveCount(3)
  })

  test('toast stack uses an aria live region', async ({ page }) => {
    const stack = page.locator('[data-testid="notification-toast-stack"]')
    await expect(stack).toHaveAttribute('aria-live', /polite|assertive/)
  })
})
