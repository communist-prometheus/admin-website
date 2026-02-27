import { expect, test } from '@playwright/test'
import { waitForApiCall } from '../helpers/network'

test('should verify mock OAuth is enabled', async ({ page }) => {
  const responsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/auth/status') && response.status() === 200
  )

  await page.goto('/')
  await waitForApiCall(page, '/api/auth/status')

  const response = await responsePromise
  const data = await response.json()
  expect(data.mockOAuth).toBe(true)
  expect(data.mockUser).toBeDefined()
})
