import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Content Loading', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should load multiple blog items in English', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.getByRole('button', { name: 'English' }).click()
    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })
    expect(await items.count()).toBe(4)
  })

  test('should load blog items across all languages', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const counts: Record<string, number> = {}
    for (const lang of ['English', 'Русский', 'Italiano', 'Español']) {
      await page.getByRole('button', { name: lang }).click()
      counts[lang] = await page
        .locator('[data-testid="content-item"]')
        .count()
    }

    expect(counts['English']).toBe(4)
    expect(counts['Русский']).toBe(3)
    expect(counts['Italiano']).toBe(1)
    expect(counts['Español']).toBe(1)
  })

  test('should load multiple page items', async ({ page }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })
    expect(await items.count()).toBe(3)
  })

  test('should load multiple position items', async ({ page }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })
    expect(await items.count()).toBe(3)
  })

  test('should display correct blog item titles', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.getByRole('button', { name: 'English' }).click()
    const list = page.locator('[data-testid="content-item"]')
    await list.first().waitFor({ state: 'visible', timeout: 15000 })

    const titles = await list.allTextContents()
    const joined = titles.join(' ')
    expect(joined).toContain('Welcome to Prometheus')
    expect(joined).toContain('Open Source Strategy')
    expect(joined).toContain('Community Update')
    expect(joined).toContain('Education Platform')
  })

  test('should show Russian blog items when filtered', async ({ page }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.getByRole('button', { name: 'Русский' }).click()
    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })

    expect(await items.count()).toBe(3)
    const texts = await items.allTextContents()
    const joined = texts.join(' ')
    expect(joined).toContain('Добро пожаловать в Prometheus')
    expect(joined).toContain('стратегия открытого кода')
    expect(joined).toContain('Новости сообщества')
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
    const expected: Record<string, number> = {
      blog: 4,
      pages: 3,
      positions: 3,
    }

    for (const section of ['blog', 'pages', 'positions']) {
      await page.goto(`/content/${section}`)
      await page.waitForLoadState('networkidle')
      await waitForContentReady(page)

      const items = page.locator('[data-testid="content-item"]')
      await items.first().waitFor({
        state: 'visible',
        timeout: 15000,
      })
      expect(await items.count()).toBe(expected[section])
    }
  })
})
