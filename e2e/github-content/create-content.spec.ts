import { expect, test } from '@playwright/test'

test.describe('GitHub Content - Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/content/blog')
  })

  test('should open create dialog', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create/i })
    await createBtn.click()

    const dialog = page.locator('[data-testid="create-dialog"]')
    await expect(dialog).toBeVisible()
  })

  test('should show required fields in create dialog', async ({ page }) => {
    await page.click('button[name="create"]')

    const dialog = page.locator('[data-testid="create-dialog"]')
    await expect(dialog.locator('input[name="slug"]')).toBeVisible()
    await expect(dialog.locator('input[name="title"]')).toBeVisible()
    await expect(dialog.locator('select[name="lang"]')).toBeVisible()
  })

  test('should show blog-specific fields for blog content', async ({
    page,
  }) => {
    await page.click('button[name="create"]')

    const dialog = page.locator('[data-testid="create-dialog"]')
    await expect(dialog.locator('input[name="description"]')).toBeVisible()
    await expect(dialog.locator('input[name="category"]')).toBeVisible()
  })

  test('should show position-specific fields for positions', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/content/positions')
    await page.click('button[name="create"]')

    const dialog = page.locator('[data-testid="create-dialog"]')
    await expect(dialog.locator('input[name="description"]')).toBeVisible()
    await expect(dialog.locator('input[name="order"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.click('button[name="create"]')
    await page.click('button[name="confirm-create"]')

    await expect(page.locator('.error-message')).toContainText(/required/i)
  })

  test('should create new content', async ({ page }) => {
    await page.route('**/api/github/file', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      })
    })

    await page.click('button[name="create"]')

    await page.fill('input[name="slug"]', 'test-post')
    await page.fill('input[name="title"]', 'Test Blog Post')
    await page.fill('input[name="description"]', 'Test description')
    await page.fill('input[name="category"]', 'Test')
    await page.selectOption('select[name="lang"]', 'en')

    await page.click('button[name="confirm-create"]')

    await expect(page.locator('.success-message')).toBeVisible()
  })
})
