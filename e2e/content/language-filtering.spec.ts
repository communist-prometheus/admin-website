import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test.describe('Language Filtering', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
  })

  test('should display all language filter buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Русский' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Italiano' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Español' })).toBeVisible()
  })

  test('should filter content by English language', async ({ page }) => {
    await page.click('button:has-text("English")')
    await page.waitForTimeout(500)

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    for (let i = 0; i < count; i++) {
      const langBadge = items.nth(i).locator('[data-testid="lang-badge"]')
      await expect(langBadge).toContainText('EN')
    }
  })

  test('should filter content by Russian language', async ({ page }) => {
    await page.click('button:has-text("Русский")')
    await page.waitForTimeout(500)

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const langBadge = items.nth(i).locator('[data-testid="lang-badge"]')
        await expect(langBadge).toContainText('RU')
      }
    }
  })

  test('should filter content by Italian language', async ({ page }) => {
    await page.click('button:has-text("Italiano")')
    await page.waitForTimeout(500)

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const langBadge = items.nth(i).locator('[data-testid="lang-badge"]')
        await expect(langBadge).toContainText('IT')
      }
    }
  })

  test('should filter content by Spanish language', async ({ page }) => {
    await page.click('button:has-text("Español")')
    await page.waitForTimeout(500)

    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const langBadge = items.nth(i).locator('[data-testid="lang-badge"]')
        await expect(langBadge).toContainText('ES')
      }
    }
  })

  test('should persist language filter when switching sections', async ({
    page,
  }) => {
    await page.click('button:has-text("Русский")')
    await page.waitForTimeout(500)

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')
    await page.waitForLoadState('networkidle')

    const russianButton = page.getByRole('button', { name: 'Русский' })
    await expect(russianButton).toHaveClass(/active|selected/)
  })

  test('should show all content when no language filter is active', async ({
    page,
  }) => {
    const allItemsCount = await page
      .locator('[data-testid="content-item"]')
      .count()

    await page.click('button:has-text("English")')
    await page.waitForTimeout(500)
    const enItemsCount = await page
      .locator('[data-testid="content-item"]')
      .count()

    await page.click('button:has-text("English")')
    await page.waitForTimeout(500)
    const resetItemsCount = await page
      .locator('[data-testid="content-item"]')
      .count()

    expect(allItemsCount).toBeGreaterThanOrEqual(enItemsCount)
    expect(resetItemsCount).toBe(allItemsCount)
  })
})
