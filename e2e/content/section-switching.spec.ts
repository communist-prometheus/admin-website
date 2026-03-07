import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'

test.describe('Content Section Switching', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should load blog content when navigating to /content/blog', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Blog')
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible()
  })

  test('should load positions content when navigating to /content/positions', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Positions')
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible()
  })

  test('should load pages content when navigating to /content/pages', async ({
    page,
  }) => {
    await page.goto('/content/pages')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('h1')).toContainText('Pages')
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible()
  })

  test('should update content list when switching from blog to positions', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page
      .locator('[data-testid="content-item"]')
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })

    const blogItems = await page
      .locator('[data-testid="content-item"]')
      .count()

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')
    await page.waitForLoadState('networkidle')

    expect(blogItems).toBeGreaterThan(0)
  })

  test('should update content list when switching from positions to pages', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')

    await page.click('a[href="/content/pages"]')
    await page.waitForURL('/content/pages')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('[data-testid="content-list"]')).toBeVisible()
  })

  test('clicking item navigates to edit page instead of inline editor', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.waitFor({ state: 'visible', timeout: 30000 })
    await firstItem.click()

    await page.waitForURL(/\/content\/blog\/edit\//, { timeout: 10000 })
    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).toBeVisible()
  })
})
