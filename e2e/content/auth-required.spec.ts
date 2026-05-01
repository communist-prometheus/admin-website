import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication Required', () => {
  test('should redirect blog to home without auth', async ({ page }) => {
    await visit(page, '/content/blog')
    await expect(page).toHaveURL('/')
  })

  test('should redirect positions to home without auth', async ({ page }) => {
    await visit(page, '/content/positions')
    await expect(page).toHaveURL('/')
  })

  test('should redirect pages to home without auth', async ({ page }) => {
    await visit(page, '/content/pages')
    await expect(page).toHaveURL('/')
  })

  test('should show login button in header when not authenticated', async ({
    page,
  }) => {
    await visit(page, '/')
    await expectVisible(page, page.getByRole('button', { name: /login/i }))
  })

  test('should not show content nav links without auth', async ({ page }) => {
    await visit(page, '/')
    await expect(page.getByRole('link', { name: /blog/i })).not.toBeVisible()
    await expect(
      page.getByRole('link', { name: /positions/i })
    ).not.toBeVisible()
    await expect(page.getByRole('link', { name: /pages/i })).not.toBeVisible()
  })
})
