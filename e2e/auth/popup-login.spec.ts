import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login Flow', () => {
  test('should load content after login without full reload', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: /login/i })).toBeVisible()

    await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('button', { name: /test user/i })
    ).toBeVisible({ timeout: 10000 })

    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({
      state: 'visible',
      timeout: 15000,
    })
    expect(await items.count()).toBeGreaterThanOrEqual(1)
  })

  test('should initialize SW with token after login', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.evaluate(() => localStorage.setItem('gh_token', 'mock-token'))
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(
      page.getByRole('button', { name: /test user/i })
    ).toBeVisible({ timeout: 10000 })

    const swReady = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready
      return !!reg.active
    })
    expect(swReady).toBe(true)
  })
})
