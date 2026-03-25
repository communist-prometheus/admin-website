import { expect, test } from '@playwright/test'

test.describe('Header Scroll Behavior', () => {
  test('scrolling down hides the header', async ({ page }) => {
    await page.goto('/content/blog')
    const header = page.locator('.app-header')
    await expect(header).toBeVisible()
    await page.evaluate(() => globalThis.scrollBy(0, 500))
    await expect(header).toHaveCSS('transform', /translateY\(-\d+/)
  })

  test('scrolling back up reveals the header', async ({ page }) => {
    await page.goto('/content/blog')
    const header = page.locator('.app-header')
    await page.evaluate(() => globalThis.scrollBy(0, 500))
    await expect(header).toHaveCSS('transform', /translateY\(-\d+/)
    await page.evaluate(() => globalThis.scrollBy(0, -300))
    await expect(header).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  })
})
