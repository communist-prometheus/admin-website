import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

const broadcastTerminal = (
  reason: 'network' | 'auth' | 'unknown'
): string => `
const ch = new BroadcastChannel('sw-push-error')
ch.postMessage({
  reason: '${reason}',
  sha: 'deadbeef',
  target: 'origin/develop',
  at: ${Date.now()},
  terminal: true,
  attempt: 5,
})
ch.close()
`

const captureControl = `
globalThis.__retryHits = 0
const ch = new BroadcastChannel('sw-push-control')
ch.onmessage = e => {
  if (e.data?.type === 'retry-now') {
    globalThis.__retryHits = (globalThis.__retryHits ?? 0) + 1
  }
}
globalThis.__retryChannel = ch
`

test.describe('push retry CTA (2.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
  })

  test('retriable terminal error attaches a Retry CTA', async ({ page }) => {
    await page.evaluate(broadcastTerminal('network'))
    const cta = page.locator('[data-testid="notification-toast-cta"]').first()
    await expect(cta).toBeVisible()
    await expect(cta).toHaveText('Retry')
  })

  test('non-retriable terminal error does NOT attach a CTA', async ({
    page,
  }) => {
    await page.evaluate(broadcastTerminal('auth'))
    const toast = page.locator('[data-testid="notification-toast"]').first()
    await expect(toast).toBeVisible()
    await expect(
      toast.locator('[data-testid="notification-toast-cta"]')
    ).toBeHidden()
  })

  test('clicking Retry posts a retry-now control message', async ({
    page,
  }) => {
    await page.evaluate(captureControl)
    await page.evaluate(broadcastTerminal('network'))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await expect
      .poll(
        async () =>
          await page.evaluate<number>(() => globalThis.__retryHits ?? 0),
        { timeout: 5_000 }
      )
      .toBe(1)
  })
})
