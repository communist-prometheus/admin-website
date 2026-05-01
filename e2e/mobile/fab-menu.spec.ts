import { expect, test } from '@prometheus/e2e-toolkit'
import { MOBILE_FAB, MOBILE_MENU } from '../helpers/mobile-constants'

test.describe('FAB Menu', () => {
  test('tapping FAB opens the menu overlay', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId(MOBILE_FAB).click()
    await expect(page.getByTestId(MOBILE_MENU)).toBeVisible()
  })

  test('menu contains navigation links', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId(MOBILE_FAB).click()
    const menu = page.getByTestId(MOBILE_MENU)
    await expect(menu.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'About' })).toBeVisible()
  })

  test('clicking a nav link navigates and closes', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId(MOBILE_FAB).click()
    await page
      .getByTestId(MOBILE_MENU)
      .getByRole('link', { name: 'About' })
      .click()
    await expect(page).toHaveURL('/about')
    await expect(page.getByTestId(MOBILE_FAB)).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  test('tapping FAB again closes the menu', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByTestId(MOBILE_FAB)
    await fab.click()
    await expect(fab).toHaveAttribute('aria-expanded', 'true')
    await fab.click()
    await expect(fab).toHaveAttribute('aria-expanded', 'false')
  })

  test('aria-expanded toggles correctly', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByTestId(MOBILE_FAB)
    await expect(fab).toHaveAttribute('aria-expanded', 'false')
    await fab.click()
    await expect(fab).toHaveAttribute('aria-expanded', 'true')
  })
})
