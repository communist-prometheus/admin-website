import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

const broadcastSummary = (synced: number): string => `
const ch = new BroadcastChannel('sw-push-summary')
ch.postMessage({ synced: ${synced}, at: ${Date.now()} })
ch.close()
`

test.describe('drain summary bridge (3.3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('summary event surfaces an info toast naming the count', async ({
    page,
  }) => {
    await page.evaluate(broadcastSummary(3))
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-kind', 'info')
    await expect(toast).toContainText('3')
  })
})
