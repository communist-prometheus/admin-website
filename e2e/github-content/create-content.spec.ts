import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'

test.describe('GitHub Content - Create', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
  })

  test('should open create dialog', async ({ page }) => {
    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()
  })

  test('should show required fields in create dialog', async ({ page }) => {
    await page.click('button:has-text("New")')
    const dialog = page.locator('.create-dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByLabel(/slug/i)).toBeVisible()
    await expect(page.getByLabel(/title/i)).toBeVisible()
  })

  test('should show blog-specific fields for blog content', async ({
    page,
  }) => {
    await page.click('button:has-text("New")')
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/category/i)).toBeVisible()
  })

  test('should show position-specific fields for positions', async ({
    page,
  }) => {
    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("New")')
    await expect(page.getByLabel(/description/i)).toBeVisible()
    await expect(page.getByLabel(/order/i)).toBeVisible()
  })

  test('should keep dialog open when submitting empty form', async ({
    page,
  }) => {
    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()
    await page.click('button:has-text("Create")')
    await expect(page.locator('.create-dialog')).toBeVisible()
  })

  test('should close dialog after cancel', async ({ page }) => {
    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()
    await page.click('button:has-text("Cancel")')
    await expect(page.locator('.create-dialog')).not.toBeVisible()
  })
})
