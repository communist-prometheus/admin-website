import { expect, test } from '@playwright/test'

test.describe('GitHub OAuth Authentication', () => {
  test('should verify mock OAuth is enabled', async ({ page }) => {
    const response = await page.request.get('/api/test/status')
    const data = await response.json()
    expect(data.mockOAuth).toBe(true)
    expect(data.mockUser).toBeDefined()
  })

  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/')

    // Should see login button in header
    const loginButton = page.getByRole('button', { name: 'Login' })
    await expect(loginButton).toBeVisible()
  })

  test('should complete login flow with mock OAuth', async ({ page }) => {
    // Use mock OAuth flow - visit auth endpoint which redirects through callback
    await page.goto('/api/auth/github')
    await page.waitForURL('/')

    // Should be redirected home and see user button
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()

    // User avatar should be visible
    const avatar = page.locator('img[alt="test-user"]')
    await expect(avatar).toBeVisible()
  })

  test('should show dropdown menu when clicking user button', async ({ page }) => {
    // Login via mock OAuth
    await page.goto('/api/auth/github')
    await page.waitForURL('/')

    // User button should be visible
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()

    // Click user button to open dropdown
    await userButton.click()

    // Dropdown should be visible
    const differentAccountButton = page.getByRole('button', {
      name: /Login with different account/i,
    })
    const logoutButton = page.getByRole('button', { name: 'Logout' })

    await expect(differentAccountButton).toBeVisible()
    await expect(logoutButton).toBeVisible()
  })

  test('should logout and show login button again', async ({ page }) => {
    // Login via mock OAuth
    await page.goto('/api/auth/github')
    await page.waitForURL('/')

    // User button should be visible
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()

    // Open dropdown and click logout
    await userButton.click()
    const logoutButton = page.getByRole('button', { name: 'Logout' })
    await logoutButton.click()

    // Should redirect and show login button again
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()
  })

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login via mock OAuth
    await page.goto('/api/auth/github')
    await page.waitForURL('/')

    // User button should be visible
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()

    // Reload page
    await page.reload()

    // Should still be authenticated (SSR should render user state)
    await expect(page.getByRole('button', { name: /Test User/i })).toBeVisible()
  })
})
