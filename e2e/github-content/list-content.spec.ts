import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'

test.describe('GitHub Content - List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/content/blog')
    await waitForNetworkIdle(page)
  })

  test('should display content list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /blog/i })).toBeVisible()

    const contentList = page.locator('[data-testid="content-list"]')
    await expect(contentList).toBeVisible()
  })

  test('should filter content by language', async ({ page }) => {
    const languageSelector = page.locator('[data-testid="language-selector"]')
    await expect(languageSelector).toBeVisible()

    await page.click('button[data-lang="ru"]')
    await waitForNetworkIdle(page)

    const items = page.locator('[data-testid="content-item"]')
    await expect(items.first()).toContainText('ru')
  })

  test('should select content item', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await waitForNetworkIdle(page)

    await expect(firstItem).toHaveClass(/selected/)

    const editor = page.locator('[data-testid="markdown-editor"]')
    await expect(editor).toBeVisible()
  })

  test('should display content types navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: /blog/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /pages/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /positions/i })).toBeVisible()
  })

  test('should navigate between content types', async ({ page }) => {
    await page.click('a[href="/content/pages"]')
    await waitForNetworkIdle(page)
    await expect(page).toHaveURL('/content/pages')
    await expect(page.getByRole('heading', { name: /pages/i })).toBeVisible()
  })

  test('should show create button', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-button"]')
    await expect(createBtn).toBeVisible()
  })
})
