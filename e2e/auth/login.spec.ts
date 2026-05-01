import { test, visit } from '@prometheus/e2e-toolkit'
import { AuthPage } from '../pages/AuthPage'
import { login } from './helpers'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login Flow', () => {
  test('should show login button when not authenticated', async ({
    page,
  }) => {
    const authPage = new AuthPage(page)

    await visit(page, '/')

    await authPage.expectLoginButtonVisible()
  })

  test('should complete login flow with mock OAuth', async ({ page }) => {
    const authPage = new AuthPage(page)

    await login(page)
    await visit(page, '/')

    await authPage.expectUserMenuVisible()
  })
})
