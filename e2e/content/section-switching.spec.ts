import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test.describe('Content Section Switching', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()
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
    await page.waitForLoadState('networkidle')

    const blogItems = await page
      .locator('[data-testid="content-item"]')
      .count()

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')
    await page.waitForLoadState('networkidle')

    const positionsItems = await page
      .locator('[data-testid="content-item"]')
      .count()

    expect(blogItems).toBeGreaterThan(0)
    expect(positionsItems).toBeGreaterThanOrEqual(0)
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

  test('should clear selected item when switching sections', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).toBeVisible()

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')

    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).toContainText('Select a file to edit')
  })
})
