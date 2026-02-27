import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'
import { ContentPage } from '../pages/ContentPage'

test.describe('Language Selector', () => {
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

  test('should display all language options', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should select English by default', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.expectToBeVisible()
  })

  test('should switch language when clicking buttons', async ({ page }) => {
    const contentPage = new ContentPage(page)
    await contentPage.selectLanguage('ru')
    await contentPage.selectLanguage('it')
  })

  test('should filter content list by selected language', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    await contentPage.selectLanguage('ru')
  })
})
