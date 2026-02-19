import { test, expect } from '@playwright/test'

test.describe('GitHub OAuth Authentication', () => {
  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should see login button in header
    const loginButton = page.getByRole('button', { name: 'Login' })
    await expect(loginButton).toBeVisible()
  })

  test('should complete login flow with mock OAuth', async ({ page, context }) => {
    await page.goto('/')
    
    // Click login button
    const loginButton = page.getByRole('button', { name: 'Login' })
    await loginButton.click()
    
    // Wait for popup window to open
    const popupPromise = context.waitForEvent('page')
    
    // Popup should open, go through OAuth flow, and close automatically
    const popup = await popupPromise
    
    // Wait for popup to close (mock OAuth should auto-complete)
    await popup.waitForEvent('close', { timeout: 5000 })
    
    // Should now see user button with test user data
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()
    
    // User avatar should be visible
    const avatar = page.locator('img[alt="test-user"]')
    await expect(avatar).toBeVisible()
  })

  test('should show dropdown menu when clicking user button', async ({ page }) => {
    await page.goto('/')
    
    // Login first
    const loginButton = page.getByRole('button', { name: 'Login' })
    await loginButton.click()
    
    // Wait for authentication
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()
    
    // Click user button to open dropdown
    await userButton.click()
    
    // Dropdown should be visible
    const differentAccountButton = page.getByRole('button', { name: /Login with different account/i })
    const logoutButton = page.getByRole('button', { name: 'Logout' })
    
    await expect(differentAccountButton).toBeVisible()
    await expect(logoutButton).toBeVisible()
  })

  test('should logout and show login button again', async ({ page }) => {
    await page.goto('/')
    
    // Login first
    const loginButton = page.getByRole('button', { name: 'Login' })
    await loginButton.click()
    
    // Wait for authentication
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
    await page.goto('/')
    
    // Login
    const loginButton = page.getByRole('button', { name: 'Login' })
    await loginButton.click()
    
    // Wait for authentication
    const userButton = page.getByRole('button', { name: /Test User/i })
    await expect(userButton).toBeVisible()
    
    // Reload page
    await page.reload()
    
    // Should still be authenticated (SSR should render user state)
    await expect(page.getByRole('button', { name: /Test User/i })).toBeVisible()
  })
})
