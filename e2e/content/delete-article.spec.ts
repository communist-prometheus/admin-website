import { expect, test } from '@playwright/test'

test.describe('Delete Article', () => {
  test('should show delete button on hover', async ({ page }) => {
    // Pages are fixed-structure (hide-delete=true). Use /content/blog so
    // delete buttons are actually rendered.
    await page.goto('/content/blog', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="content-item"]', {
      timeout: 20000,
    })

    const item = page.locator('[data-testid="content-item"]').first()
    await item.hover()

    const deleteBtn = item.locator('[data-testid="delete-item-btn"]')
    await expect(deleteBtn).toBeVisible({ timeout: 5000 })
  })

  test('should show delete confirmation dialog', async ({ page }) => {
    // Pages are fixed-structure (hide-delete=true). Use /content/blog so
    // delete buttons are actually rendered.
    await page.goto('/content/blog', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="content-item"]', {
      timeout: 20000,
    })

    const item = page.locator('[data-testid="content-item"]').first()
    await item.hover()
    await item.locator('[data-testid="delete-item-btn"]').click()

    const dialog = page.locator('[data-testid="delete-dialog"]')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    await expect(page.locator('[data-testid="delete-all-btn"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="delete-lang-btn"]')
    ).toBeVisible()
    await expect(
      page.locator('[data-testid="delete-cancel-btn"]')
    ).toBeVisible()
  })

  test('should close dialog on cancel', async ({ page }) => {
    // Pages are fixed-structure (hide-delete=true). Use /content/blog so
    // delete buttons are actually rendered.
    await page.goto('/content/blog', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="content-item"]', {
      timeout: 20000,
    })

    const item = page.locator('[data-testid="content-item"]').first()
    await item.hover()
    await item.locator('[data-testid="delete-item-btn"]').click()

    const dialog = page.locator('[data-testid="delete-dialog"]')
    await expect(dialog).toBeVisible({ timeout: 5000 })

    await page.locator('[data-testid="delete-cancel-btn"]').click()
    await expect(dialog).not.toBeVisible()
  })

  test.skip('delete all should remove item from list', async ({ page }) => {
    // Pages are fixed-structure (hide-delete=true). Use /content/blog so
    // delete buttons are actually rendered.
    await page.goto('/content/blog', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="content-item"]', {
      timeout: 20000,
    })

    const initialCount = await page
      .locator('[data-testid="content-item"]')
      .count()

    const item = page.locator('[data-testid="content-item"]').first()
    await item.hover()
    await item.locator('[data-testid="delete-item-btn"]').click()

    await page.locator('[data-testid="delete-all-btn"]').click()

    // Wait for list to update
    await expect(page.locator('[data-testid="content-item"]')).toHaveCount(
      initialCount - 1,
      { timeout: 15000 }
    )
  })
})
