import { expect, test } from '@playwright/test'
import { ROUTES } from './constants'
import {
  getLoginButton,
  getUserAvatar,
  getUserButton,
  loginViaMockOAuth,
} from './helpers'

test.describe('Login Flow', () => {
  test('should show login button when not authenticated', async ({
    page,
  }) => {
    await page.goto(ROUTES.home)
    await expect(getLoginButton(page)).toBeVisible()
  })

  test('should complete login flow with mock OAuth', async ({ page }) => {
    await loginViaMockOAuth(page)
    await expect(getUserButton(page)).toBeVisible()
    await expect(getUserAvatar(page)).toBeVisible()
  })
})
