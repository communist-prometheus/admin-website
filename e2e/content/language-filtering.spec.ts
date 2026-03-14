import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Language Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)
  })

  test('should display all language filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Русский' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Italiano' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Español' })).toBeVisible()
  })

  test('should filter content by English language', async ({ page }) => {
    await page.getByRole('button', { name: 'English' }).click()

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    for (let i = 0; i < count; i++) {
      const langBadge = items.nth(i).locator('.lang-badge')
      await expect(langBadge).toContainText('en')
    }
  })

  test('should filter content by Russian language', async ({ page }) => {
    await page.getByRole('button', { name: 'Русский' }).click()

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const langBadge = items.nth(i).locator('.lang-badge')
        await expect(langBadge).toContainText('ru')
      }
    }
  })

  test('should filter content by Italian language', async ({ page }) => {
    await page.getByRole('button', { name: 'Italiano' }).click()

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const langBadge = items.nth(i).locator('.lang-badge')
        await expect(langBadge).toContainText('it')
      }
    }
  })

  test('should filter content by Spanish language', async ({ page }) => {
    await page.getByRole('button', { name: 'Español' }).click()

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const langBadge = items.nth(i).locator('.lang-badge')
        await expect(langBadge).toContainText('es')
      }
    }
  })

  test('should persist language filter when switching sections', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Русский' }).click()
    await expect(page.getByRole('button', { name: 'Русский' })).toHaveClass(
      /active/
    )

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')
    await waitForContentReady(page)

    await expect(page.getByRole('button', { name: 'Русский' })).toHaveClass(
      /active/
    )
  })

  test('should show all content when no language filter is active', async ({
    page,
  }) => {
    const items = page.locator('[data-testid="content-item"]')
    await items.first().waitFor({ state: 'visible', timeout: 15000 })
    const allItemsCount = await items.count()

    await page.getByRole('button', { name: 'English' }).click()
    await expect(page.getByRole('button', { name: 'English' })).toHaveClass(
      /active/
    )
    const enItemsCount = await items.count()

    await page.getByRole('button', { name: 'English' }).click()
    await items.first().waitFor({ state: 'visible', timeout: 5000 })
    const resetItemsCount = await items.count()

    expect(allItemsCount).toBeGreaterThanOrEqual(enItemsCount)
    expect(resetItemsCount).toBe(allItemsCount)
  })
})
