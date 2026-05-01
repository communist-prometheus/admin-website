import { test, visit } from '@prometheus/e2e-toolkit'
import { AuthPage } from './pages/AuthPage'

test.use({ storageState: { cookies: [], origins: [] } })

test('visits the app root url', async ({ page }) => {
  const authPage = new AuthPage(page)

  await visit(page, '/')

  await authPage.expectLoginButtonVisible()
})
