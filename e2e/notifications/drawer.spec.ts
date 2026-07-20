import { expect, type Page, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

/*
 * Fire the dev-trigger notifications, then wait for the unread badge to
 * reach the expected total before reading the drawer. The queue appends
 * synchronously, but rapid back-to-back clicks let a `toHaveCount` read a
 * half-populated list; the badge (queue length) reaching `total` is the
 * event that proves every notification registered. Event-driven, no delay.
 */
const fireAndSettle = async (
  page: Page,
  kinds: readonly string[]
): Promise<void> => {
  for (const kind of kinds) {
    await page.locator(`[data-testid="notify-trigger-${kind}"]`).click()
  }
  await expect(
    page.locator('[data-testid="notification-indicator-badge"]')
  ).toHaveText(String(kinds.length))
}

test.describe('notifications: history drawer (1.3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('indicator click opens drawer with the queued entries', async ({
    page,
  }) => {
    const drawer = page.locator('[data-testid="notification-drawer"]')
    await expect(drawer).toBeHidden()
    await fireAndSettle(page, ['info', 'error'])
    await page.locator('[data-testid="notification-indicator"]').click()
    await expect(drawer).toBeVisible()
    await expect(
      page.locator('[data-testid="notification-drawer-item"]')
    ).toHaveCount(2)
  })

  test('history persists across reload', async ({ page }) => {
    await page.locator('[data-testid="notify-trigger-info"]').click()
    await page.locator('[data-testid="notification-indicator"]').click()
    await expect(
      page.locator('[data-testid="notification-drawer-item"]')
    ).toHaveCount(1)
    await page.reload()
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
    await page.locator('[data-testid="notification-indicator"]').click()
    await expect(
      page.locator('[data-testid="notification-drawer-item"]')
    ).toHaveCount(1)
  })

  test('clear all empties the history', async ({ page }) => {
    await fireAndSettle(page, ['info', 'error'])
    await page.locator('[data-testid="notification-indicator"]').click()
    const items = page.locator('[data-testid="notification-drawer-item"]')
    await expect(items).toHaveCount(2)
    await page.locator('[data-testid="notification-drawer-clear"]').click()
    await expect(items).toHaveCount(0)
    await expect(
      page.locator('[data-testid="notification-drawer-empty"]')
    ).toBeVisible()
  })

  test('filter by kind narrows the list', async ({ page }) => {
    await fireAndSettle(page, ['info', 'error', 'error'])
    await page.locator('[data-testid="notification-indicator"]').click()
    const items = page.locator('[data-testid="notification-drawer-item"]')
    await expect(items).toHaveCount(3)
    await page
      .locator('[data-testid="notification-drawer-filter-error"]')
      .click()
    await expect(items).toHaveCount(2)
    for (const item of await items.all()) {
      await expect(item).toHaveAttribute('data-kind', 'error')
    }
  })

  test('mark all read flips items to data-read=true', async ({ page }) => {
    await fireAndSettle(page, ['info', 'error'])
    await page.locator('[data-testid="notification-indicator"]').click()
    const items = page.locator('[data-testid="notification-drawer-item"]')
    await expect(items).toHaveCount(2)
    await page
      .locator('[data-testid="notification-drawer-mark-read"]')
      .click()
    for (const item of await items.all()) {
      await expect(item).toHaveAttribute('data-read', 'true')
    }
  })
})
