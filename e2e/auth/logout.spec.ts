import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'
import { login } from './helpers'

test('should logout and show login button again', async ({ page }) => {
  const authPage = new AuthPage(page)

  await login(page)
  await page.goto('/')
  await waitForNetworkIdle(page)

  await authPage.expectUserMenuVisible()

  await authPage.clickUserMenu()
  await authPage.clickLogout()

  await authPage.expectLoginButtonVisible()
})
