import { test, visit } from '@prometheus/e2e-toolkit'
import { AuthPage } from '../pages/AuthPage'
import { login } from './helpers'

test.use({ storageState: { cookies: [], origins: [] } })

test('should logout and show login button again', async ({ page }) => {
  const authPage = new AuthPage(page)

  await login(page)
  await visit(page, '/')

  await authPage.expectUserMenuVisible()

  await authPage.clickUserMenu()
  await authPage.clickLogout()

  await authPage.expectLoginButtonVisible()
})
