import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'

test('should verify mock auth provides user', async ({ page }) => {
  await visit(page, '/')

  const hasUser = await page.evaluate(
    () => !!localStorage.getItem('gh_token')
  )
  expect(hasUser).toBe(true)

  await expectVisible(page, page.getByRole('button', { name: /test user/i }))
})
