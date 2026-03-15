import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'
import { ContentPage } from '../pages/ContentPage'

test.describe('Content Edit Page', () => {
  test('clicking content item navigates to edit page', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
    await contentPage.selectItem('Welcome to Prometheus')

    await page.waitForURL(/\/content\/blog\/edit\/welcome-to-prometheus/, {
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="edit-title"]')).toHaveText(
      'welcome-to-prometheus'
    )
  })

  test('edit page shows correct file content', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const content = await editPage.getEditorBody().inputValue()
    expect(content).toContain('Welcome to Prometheus')
  })

  test('edit page shows language selector with English active', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const selector = page.locator('[data-testid="language-selector"]')
    await expect(selector).toBeVisible()

    const activeBtn = selector.locator('button.active')
    await expect(activeBtn).toHaveText('English')
  })

  test('back button returns to list', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await editPage.clickBack()
    await page.waitForURL(/\/content\/blog$/, {
      timeout: 10000,
    })
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible()
  })
})
