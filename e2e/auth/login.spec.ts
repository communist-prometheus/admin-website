import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test.describe('Login Flow', () => {
  test('should show login button when not authenticated', async ({
    page,
  }) => {
    const authPage = new AuthPage(page)

    await page.goto('/')
    await waitForNetworkIdle(page)

    await authPage.expectLoginButtonVisible()
  })

  test('should complete login flow with mock OAuth', async ({ page }) => {
    const authPage = new AuthPage(page)

    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()

    await authPage.expectUserMenuVisible()
  })
})
