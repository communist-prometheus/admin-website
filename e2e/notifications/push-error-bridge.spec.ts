import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

const broadcastError = (
  reason: 'network' | 'auth' | 'non-fast-forward' | 'validation' | 'unknown',
  target = 'origin/develop'
): string => `
const ch = new BroadcastChannel('sw-push-error')
ch.postMessage({
  reason: '${reason}',
  sha: 'abc123',
  target: '${target}',
  at: ${Date.now()},
})
ch.close()
`

test.describe('push error bridge → notification (2.3)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('network error fires a sticky notification with target', async ({
    page,
  }) => {
    await page.evaluate(broadcastError('network'))
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toHaveAttribute('data-kind', 'error')
    await expect(toast).toContainText('origin/develop')
  })

  test('non-fast-forward emits distinct copy', async ({ page }) => {
    await page.evaluate(broadcastError('non-fast-forward'))
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(toast).toContainText(/rejected|remote/i)
  })

  test('every reason produces a unique toast', async ({ page }) => {
    const reasons: ReadonlyArray<
      'network' | 'auth' | 'non-fast-forward' | 'validation' | 'unknown'
    > = ['network', 'auth', 'non-fast-forward', 'validation', 'unknown']
    for (const reason of reasons) {
      await page.evaluate(broadcastError(reason))
    }
    const toasts = page.locator('[data-testid="notification-toast"]')
    await expect(toasts).toHaveCount(3)
  })
})
