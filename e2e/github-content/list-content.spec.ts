import {
  click,
  expect,
  expectText,
  expectVisible,
  test,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
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
      await expectText(page, items.first().locator('.lang-badge'), 'ru')
    }
  })

  test('should select content item', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await expectVisible(page, firstItem)
    await click(page, firstItem)
    await expectVisible(page, page.locator('[data-testid="markdown-editor"]'))
  })

  test('should display content types navigation', async ({ page }) => {
    await expectVisible(page, page.getByRole('link', { name: /blog/i }))
    await expectVisible(page, page.getByRole('link', { name: /pages/i }))
    await expectVisible(page, page.getByRole('link', { name: /positions/i }))
  })

  test('should navigate between content types', async ({ page }) => {
    await click(page, page.locator('a[href="/content/pages"]'))
    await waitForCondition(page, async () =>
      page.url().includes('/content/pages')
    )
    /* No page heading on ContentView — assert by URL + content list. */
    expect(page.url()).toContain('/content/pages')
    await expectVisible(page, page.locator('[data-testid="content-list"]'))
  })

  test('should show create button', async ({ page }) => {
    await expectVisible(page, page.getByRole('button', { name: /new/i }))
  })
})
