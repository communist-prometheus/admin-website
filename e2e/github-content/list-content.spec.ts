import { expect, test } from '@playwright/test'
import { ContentPage } from '../pages/ContentPage'
import { waitForNetworkIdle } from '../helpers/network'

test.describe('GitHub Content - List', () => {
  let contentPage: ContentPage

  test.beforeEach(async ({ page }) => {
    contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
  })

  test('should display content list', async () => {
    await contentPage.expectToBeVisible()
    await contentPage.expectItemCount(1)
  })

  test('should filter content by language', async () => {
    await contentPage.selectLanguage('ru')
    await contentPage.expectItemCount(1)
    await contentPage.expectItemWithTitle('Prometheus')
  })

  test('should select content item', async ({ page }) => {
    await contentPage.selectItem('Prometheus')

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
