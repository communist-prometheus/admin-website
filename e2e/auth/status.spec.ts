import { expect, test } from '@playwright/test'
import { AUTH_ENDPOINTS } from './constants'

test('should verify mock OAuth is enabled', async ({ page }) => {
  const response = await page.request.get(AUTH_ENDPOINTS.status)
  const data = await response.json()
  expect(data.mockOAuth).toBe(true)
  expect(data.mockUser).toBeDefined()
})
