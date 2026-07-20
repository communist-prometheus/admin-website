import { expect, test } from '@prometheus/e2e-toolkit'
import { waitForSWControl } from '../helpers/visit-settled'

const broadcastConflict = (files: ReadonlyArray<string>): string => `
const ch = new BroadcastChannel('sw-push-conflict')
ch.postMessage({
  sha: 'def456',
  target: 'origin/develop',
  files: ${JSON.stringify(files)},
  at: ${Date.now()},
})
ch.close()
`

const captureControl = `
globalThis.__resolveMessages = []
const ch = new BroadcastChannel('sw-push-control')
ch.onmessage = e => globalThis.__resolveMessages.push(e.data)
globalThis.__resolveChannel = ch
`

test.describe('per-file conflict resolution (4.3)', () => {
  test.beforeEach(async ({ page }) => {
    await page
      .evaluate(() => globalThis.localStorage?.removeItem('admin-conflicts'))
      .catch(() => undefined)
    await page.goto('/')
    await waitForSWControl(page)
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
    await page.evaluate(captureControl)
  })

  test('keep mine flips the row to resolved + posts message', async ({
    page,
  }) => {
    await page.evaluate(broadcastConflict(['a.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await page.locator('[data-testid="conflicts-item-keep-mine"]').click()
    await expect(
      page.locator('[data-testid="conflicts-item-resolved"]')
    ).toContainText('mine')
    const messages = await page.evaluate<readonly { type: string }[]>(
      () => globalThis.__resolveMessages ?? []
    )
    expect(messages.some(m => m.type === 'resolve-file')).toBe(true)
  })

  test('finalize appears once every file is resolved', async ({ page }) => {
    await page.evaluate(broadcastConflict(['a.md', 'b.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    const finalize = page.locator('[data-testid="conflicts-finalize"]')
    await expect(finalize).toBeHidden()
    await page
      .locator('[data-testid="conflicts-item-keep-mine"]')
      .first()
      .click()
    await expect(finalize).toBeHidden()
    await page
      .locator('[data-testid="conflicts-item-take-theirs"]')
      .first()
      .click()
    await expect(finalize).toBeVisible()
  })

  test('finalize click posts finalize-resolution + clears list', async ({
    page,
  }) => {
    await page.evaluate(broadcastConflict(['a.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await page.locator('[data-testid="conflicts-item-force-mine"]').click()
    await page.locator('[data-testid="conflicts-finalize"]').click()
    await expect(
      page.locator('[data-testid="conflicts-empty"]')
    ).toBeVisible()
    const messages = await page.evaluate<readonly { type: string }[]>(
      () => globalThis.__resolveMessages ?? []
    )
    expect(messages.some(m => m.type === 'finalize-resolution')).toBe(true)
  })
})
