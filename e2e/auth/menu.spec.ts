import { test, visit } from '@prometheus/e2e-toolkit'
import { AuthPage } from '../pages/AuthPage'

test('should show dropdown menu when clicking user button', async ({
  page,
}) => {
  const authPage = new AuthPage(page)

  await visit(page, '/')

  await authPage.expectUserMenuVisible()
  await authPage.clickUserMenu()

  await authPage.expectDropdownVisible()
})
