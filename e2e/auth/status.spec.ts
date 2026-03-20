import { expect, test } from '@playwright/test'

test('should verify mock auth provides user', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const hasUser = await page.evaluate(
    () => !!localStorage.getItem('gh_token')
  )
  expect(hasUser).toBe(true)

  await expect(page.getByRole('button', { name: /test user/i })).toBeVisible({
    timeout: 10000,
  })
})
