import { expect, test } from '@playwright/test'

const broadcastConflict = (files: ReadonlyArray<string>): string => `
const ch = new BroadcastChannel('sw-push-conflict')
ch.postMessage({
  sha: 'fa11',
  target: 'origin/develop',
  files: ${JSON.stringify(files)},
  at: ${Date.now()},
})
ch.close()
`

const captureControl = `
globalThis.__visualMergeMessages = []
const ch = new BroadcastChannel('sw-push-control')
ch.onmessage = e => globalThis.__visualMergeMessages.push(e.data)
globalThis.__visualMergeChannel = ch
`

test.describe('visual merge editor (4.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page
      .evaluate(() => globalThis.localStorage?.removeItem('admin-conflicts'))
      .catch(() => undefined)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page
      .locator('[data-testid="notification-indicator"]')
      .waitFor({ state: 'visible' })
    await page.evaluate(captureControl)
  })

  test('visual merge link routes to the editor', async ({ page }) => {
    await page.evaluate(broadcastConflict(['blog/sample/index.en.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await page.locator('[data-testid="conflicts-item-visual-merge"]').click()
    await expect(page).toHaveURL(/\/conflicts\/merge\//)
    await expect(
      page.locator('[data-testid="visual-merge-view"]')
    ).toBeVisible()
  })

  test('cancel returns to /conflicts without writing', async ({ page }) => {
    await page.evaluate(broadcastConflict(['x.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await page.locator('[data-testid="conflicts-item-visual-merge"]').click()
    await page.locator('[data-testid="visual-merge-cancel"]').click()
    await expect(page).toHaveURL(/\/conflicts$/)
    const messages = await page.evaluate<readonly { type: string }[]>(
      () => globalThis.__visualMergeMessages ?? []
    )
    expect(messages.some(m => m.type === 'resolve-file-content')).toBe(false)
  })

  test('save posts resolve-file-content + flips row to resolved', async ({
    page,
  }) => {
    await page.evaluate(broadcastConflict(['y.md']))
    await page.locator('[data-testid="notification-toast-cta"]').click()
    await page.locator('[data-testid="conflicts-item-visual-merge"]').click()
    await page.locator('[data-testid="visual-merge-save"]').click()
    await expect(page).toHaveURL(/\/conflicts$/)
    await expect(
      page.locator('[data-testid="conflicts-item-resolved"]')
    ).toContainText('mine')
    const messages = await page.evaluate<readonly { type: string }[]>(
      () => globalThis.__visualMergeMessages ?? []
    )
    expect(messages.some(m => m.type === 'resolve-file-content')).toBe(true)
  })
})
