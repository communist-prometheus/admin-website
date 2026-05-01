import { expect, test } from '@prometheus/e2e-toolkit'
import { MOBILE_FAB } from '../helpers/mobile-constants'

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
