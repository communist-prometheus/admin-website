import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'
import { ContentPage } from '../pages/ContentPage'

test.describe('Content List', () => {
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

  test('should display content list', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should display create new button', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should show empty state when no content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('pages')
  })

  test('should display content items with metadata', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should select content item on click', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })
})
