import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test('should show dropdown menu when clicking user button', async ({
  page,
}) => {
  const authPage = new AuthPage(page)

  await page.goto('/')
  await waitForNetworkIdle(page)
  await authPage.mockLogin()

  await authPage.expectUserMenuVisible()
  await authPage.clickUserMenu()

  await authPage.expectDropdownVisible()
})
