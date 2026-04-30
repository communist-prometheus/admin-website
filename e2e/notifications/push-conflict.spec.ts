import { expect, test } from '@playwright/test'

const broadcastConflict = (files: ReadonlyArray<string>): string => `
const ch = new BroadcastChannel('sw-push-conflict')
ch.postMessage({
  sha: 'beefcafe',
  target: 'origin/develop',
  files: ${JSON.stringify(files)},
  at: ${Date.now()},
})
ch.close()
`

test.describe('push conflict bridge (4.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('conflict event surfaces a sticky conflict toast', async ({
    page,
  }) => {
    await page.evaluate(broadcastConflict(['blog/a/index.en.md']))
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-kind', 'conflict')
    await expect(toast).toHaveAttribute('data-sticky', 'true')
    await expect(toast).toContainText('1')
  })

  test('multi-file conflict reports the count', async ({ page }) => {
    await page.evaluate(broadcastConflict(['a.md', 'b.md', 'c.md']))
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText('3')
  })
})
