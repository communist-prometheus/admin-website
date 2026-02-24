import { expect, test } from '@playwright/test'
import { getUserButton, loginViaMockOAuth } from './helpers'

test('should persist authentication across page reloads', async ({
  page,
}) => {
  await loginViaMockOAuth(page)
  await expect(getUserButton(page)).toBeVisible()

  await page.reload()

  await expect(getUserButton(page)).toBeVisible()
})
