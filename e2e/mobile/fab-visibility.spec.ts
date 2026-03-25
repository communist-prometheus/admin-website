import { expect, test } from '@playwright/test'
import { MOBILE_FAB } from './constants'

test.describe('FAB Visibility', () => {
  test('FAB button is visible on mobile viewport', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId(MOBILE_FAB)).toBeVisible()
  })

  test('desktop nav is NOT visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.app-nav')).toBeHidden()
  })

  test('auth button is NOT visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.auth-slot')).toBeHidden()
  })
})
