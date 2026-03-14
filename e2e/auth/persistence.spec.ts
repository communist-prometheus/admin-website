import { test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test('should persist authentication across page reloads', async ({
  page,
}) => {
  const authPage = new AuthPage(page)

  await page.goto('/')
  await waitForNetworkIdle(page)

  await authPage.expectUserMenuVisible()

  await page.reload()
  await waitForNetworkIdle(page)

  await authPage.expectUserMenuVisible()
})
