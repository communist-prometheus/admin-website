import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Content Loading', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should load all blog items across all languages', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const allCounts: number[] = []

    for (const lang of ['English', 'Русский', 'Italiano', 'Español']) {
      await page.getByRole('button', { name: lang }).click()
      const items = page.locator('[data-testid="content-item"]')
      const count = await items.count()
      allCounts.push(count)
    }

    const total = allCounts.reduce((a, b) => a + b, 0)
    expect(total).toBe(4)
    expect(allCounts).toEqual([1, 1, 1, 1])
  })

  test('should load page items', async ({ page }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })
    const count = await items.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should load position items', async ({ page }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })
    const count = await items.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should display correct blog item title', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.getByRole('button', { name: 'English' }).click()
    const item = page.locator('[data-testid="content-item"]').first()
    await item.waitFor({ state: 'visible', timeout: 15000 })
    await expect(item).toContainText('Welcome to Prometheus')
  })

  test('should show Russian blog item when filtered', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.getByRole('button', { name: 'Русский' }).click()
    const item = page.locator('[data-testid="content-item"]').first()
    await item.waitFor({ state: 'visible', timeout: 15000 })
    await expect(item).toContainText('Добро пожаловать в Prometheus')
  })

  test('should not show loading overlay after content loads', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await expect(page.locator('.loading-overlay')).toBeHidden()
  })

  test('should load content on all sections without reload', async ({
    page,
  }) => {
    for (const section of ['blog', 'pages', 'positions']) {
      await page.goto(`/content/${section}`)
      await page.waitForLoadState('networkidle')
      await waitForContentReady(page)

      const items = page.locator('[data-testid="content-item"]')
      await items.first().waitFor({ state: 'visible', timeout: 15000 })
      const count = await items.count()
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })
})
