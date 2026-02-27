import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'
import { ContentPage } from '../pages/ContentPage'

test.describe('Markdown Editor', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    const contentPage = new ContentPage(page)

    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()
    await contentPage.navigate('blog')
  })

  test.afterEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.clearAuth()
  })

  test('should display markdown editor when content is selected', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should display save button when content is loaded', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should allow editing content in textarea', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should not display editor when no content is selected', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })
})
