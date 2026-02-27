import { test } from '@playwright/test'
import { waitForNetworkIdle } from './helpers/network'
import { AuthPage } from './pages/AuthPage'

test('visits the app root url', async ({ page }) => {
  const authPage = new AuthPage(page)

  await page.goto('/')
  await waitForNetworkIdle(page)

  await authPage.expectLoginButtonVisible()
})
