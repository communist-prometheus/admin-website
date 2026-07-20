import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

const broadcast = (
  pending: number,
  status: 'idle' | 'syncing' | 'error'
): string => `
const ch = new BroadcastChannel('sw-push-state')
ch.postMessage({ status: '${status}', pending: ${pending} })
ch.close()
`

test.describe('push sync badge (2.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('badge stays hidden while idle and pending=0', async ({ page }) => {
    const badge = page.locator('[data-testid="push-sync-badge"]')
    await expect(badge).toBeHidden()
  })

  test('syncing state surfaces with pending count', async ({ page }) => {
    await page.evaluate(broadcast(2, 'syncing'))
    const badge = page.locator('[data-testid="push-sync-badge"]')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveAttribute('data-status', 'syncing')
    await expect(
      page.locator('[data-testid="push-sync-badge-count"]')
    ).toHaveText('2')
  })

  test('error state surfaces and does not pulse', async ({ page }) => {
    await page.evaluate(broadcast(1, 'error'))
    const badge = page.locator('[data-testid="push-sync-badge"]')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveAttribute('data-status', 'error')
  })

  test('drain success returns the badge to hidden', async ({ page }) => {
    const badge = page.locator('[data-testid="push-sync-badge"]')
    await page.evaluate(broadcast(1, 'syncing'))
    await expect(badge).toBeVisible()
    await page.evaluate(broadcast(0, 'idle'))
    await expect(badge).toBeHidden()
  })
})
