import { expect, test } from '@playwright/test'
import { ContentPage } from '../pages/ContentPage'

test.describe('GitHub Content - List', () => {
  let contentPage: ContentPage

  test.beforeEach(async ({ page }) => {
    contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
  })

  test('should display content list', async () => {
    await contentPage.expectToBeVisible()
  })

  test('should filter content by language', async ({ page }) => {
    await contentPage.selectLanguage('ru')
    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()
    if (count > 0) {
      const langBadge = items.first().locator('.lang-badge')
      await expect(langBadge).toContainText('ru')
    }
  })

  test('should select content item', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.waitFor({ state: 'visible', timeout: 30000 })
    await firstItem.click()

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
    await page.waitForURL('/content/pages')
    // There's no page heading in ContentView — assert by URL + content list.
    expect(page.url()).toContain('/content/pages')
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible()
  })

  test('should show create button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })
})
