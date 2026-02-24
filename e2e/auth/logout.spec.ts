import { expect, test } from '@playwright/test'
import {
  getLoginButton,
  getLogoutButton,
  getUserButton,
  loginViaMockOAuth,
} from './helpers'

test('should logout and show login button again', async ({ page }) => {
  await loginViaMockOAuth(page)
  await expect(getUserButton(page)).toBeVisible()

  await getUserButton(page).click()
  await getLogoutButton(page).click()

  await expect(getLoginButton(page)).toBeVisible()
})
