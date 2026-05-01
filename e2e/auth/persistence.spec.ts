import { test, visit, waitForCondition } from '@prometheus/e2e-toolkit'
import { AuthPage } from '../pages/AuthPage'

test('should persist authentication across page reloads', async ({
  page,
}) => {
  const authPage = new AuthPage(page)

  await visit(page, '/')

  await authPage.expectUserMenuVisible()

  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForCondition(page, async () => true)

  await authPage.expectUserMenuVisible()
})
