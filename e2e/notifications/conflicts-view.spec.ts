import { expect, test } from '@prometheus/e2e-toolkit'

const broadcastConflict = (files: ReadonlyArray<string>): string => `
const ch = new BroadcastChannel('sw-push-conflict')
ch.postMessage({
  sha: 'abc123',
  target: 'origin/develop',
  files: ${JSON.stringify(files)},
  at: ${Date.now()},
})
ch.close()
`

test.describe('conflicts view (4.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page
      .evaluate(() => globalThis.localStorage?.removeItem('admin-conflicts'))
      .catch(() => undefined)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('toast Resolve CTA navigates to /conflicts and lists files', async ({
    page,
  }) => {
    await page.evaluate(broadcastConflict(['blog/a/index.en.md', 'b.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await expect(page).toHaveURL(/\/conflicts$/)
    const items = page.locator('[data-testid="conflicts-item"]')
    await expect(items).toHaveCount(2)
  })

  test('reload preserves the conflict list', async ({ page }) => {
    await page.evaluate(broadcastConflict(['c.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await expect(page.locator('[data-testid="conflicts-item"]')).toHaveCount(
      1
    )
    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="conflicts-item"]')).toHaveCount(
      1
    )
  })

  test('mark all resolved empties the list', async ({ page }) => {
    await page.evaluate(broadcastConflict(['x.md', 'y.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await expect(page.locator('[data-testid="conflicts-item"]')).toHaveCount(
      2
    )
    await page.locator('[data-testid="conflicts-resolve-all"]').click()
    await expect(
      page.locator('[data-testid="conflicts-empty"]')
    ).toBeVisible()
  })
})
