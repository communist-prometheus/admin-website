import { expect, test } from '@playwright/test'

test('should verify mock OAuth authenticates user', async ({ page }) => {
  await page.goto('/')

  const response = await page.request.get('/api/auth/user')
  const data = await response.json()
  expect(data.authenticated).toBe(true)
  expect(data.user).toBeDefined()
  expect(data.user.username).toBe('test-user')
})
