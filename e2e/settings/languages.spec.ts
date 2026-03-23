import { expect, test } from '@playwright/test'

test.describe('Settings - Languages', () => {
  test('should show Settings link in header navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.app-nav', { timeout: 20000 })
    const settingsLink = page.locator('.app-nav a[href="/settings"]')
    await expect(settingsLink).toBeVisible()
    await expect(settingsLink).toHaveText('Settings')
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1')).toHaveText('Settings')
    await expect(page.locator('h2')).toHaveText('Languages')
  })

  test('should show languages editor with table', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    const editor = page.locator('[data-testid="languages-editor"]')
    await expect(editor).toBeVisible({ timeout: 20000 })

    const table = page.locator('[data-testid="languages-table"]')
    await expect(table).toBeVisible()
  })

  test('should display language rows from settings', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="language-row"]', {
      timeout: 20000,
    })

    const rows = page.locator('[data-testid="language-row"]')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)

    const firstCode = rows.first().locator('[data-testid="language-code"]')
    await expect(firstCode).toHaveValue('en')
  })

  test('should add a new language row', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="language-row"]', {
      timeout: 20000,
    })

    const initialCount = await page
      .locator('[data-testid="language-row"]')
      .count()

    await page.locator('[data-testid="add-language"]').click()

    await expect(page.locator('[data-testid="language-row"]')).toHaveCount(
      initialCount + 1
    )
  })

  test('should remove a language row', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="language-row"]', {
      timeout: 20000,
    })

    const initialCount = await page
      .locator('[data-testid="language-row"]')
      .count()

    await page
      .locator('[data-testid="remove-language"]')
      .last()
      .click()

    await expect(page.locator('[data-testid="language-row"]')).toHaveCount(
      initialCount - 1
    )
  })

  test('should show save button', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('[data-testid="languages-editor"]', {
      timeout: 20000,
    })

    const saveBtn = page.locator('[data-testid="save-languages"]')
    await expect(saveBtn).toBeVisible()
    await expect(saveBtn).toHaveText('Save')
  })
})
