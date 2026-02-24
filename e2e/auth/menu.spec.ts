import { expect, test } from '@playwright/test'
import {
  getDifferentAccountButton,
  getLogoutButton,
  getUserButton,
  loginViaMockOAuth,
} from './helpers'

test('should show dropdown menu when clicking user button', async ({
  page,
}) => {
  await loginViaMockOAuth(page)
  await expect(getUserButton(page)).toBeVisible()

  await getUserButton(page).click()

  await expect(getDifferentAccountButton(page)).toBeVisible()
  await expect(getLogoutButton(page)).toBeVisible()
})
