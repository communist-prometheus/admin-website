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
    /*
     * Content links live inside the "Content" dropdown group now —
     * open it before asserting the links are visible. Scope to the
     * desktop app-nav so the mobile-drawer copies of the same links
     * don't trip strict mode.
     */
    const nav = page.getByTestId('app-nav')
    await click(page, page.getByTestId('nav-group-content'))
    /*
     * Inside a role="menu" dropdown the RouterLinks carry role=menuitem
     * (proper ARIA). Query by that role, not by role=link.
     */
    await expectVisible(page, nav.getByRole('menuitem', { name: /blog/i }))
    await expectVisible(page, nav.getByRole('menuitem', { name: /pages/i }))
    await expectVisible(
      page,
      nav.getByRole('menuitem', { name: /positions/i })
    )
  })

  test('should navigate between content types', async ({ page }) => {
    await click(page, page.getByTestId('nav-group-content'))
    await click(
      page,
      page.getByTestId('app-nav').locator('a[href="/content/pages"]')
    )
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
