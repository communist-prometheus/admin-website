import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'
import { ContentPage } from '../pages/ContentPage'

test.describe('Content Navigation', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()
  })

  test.afterEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await authPage.clearAuth()
  })

  test('should navigate to blog content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
    await expect(page).toHaveURL('/content/blog')
    await contentPage.expectToBeVisible()
  })

  test('should navigate to positions content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('positions')
    await expect(page).toHaveURL('/content/positions')
    await contentPage.expectToBeVisible()
  })

  test('should navigate to pages content', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('pages')
    await expect(page).toHaveURL('/content/pages')
    await contentPage.expectToBeVisible()
  })

  test('should display content navigation links', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
    await contentPage.expectToBeVisible()
  })

  test('should switch between content types using navigation', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)

    await contentPage.navigate('blog')
    await expect(page).toHaveURL('/content/blog')

    await contentPage.navigate('positions')
    await expect(page).toHaveURL('/content/positions')

    await contentPage.navigate('pages')
    await expect(page).toHaveURL('/content/pages')
  })
})
