import { expect, test } from '@playwright/test'

test.describe('GitHub Content - Edit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/content/blog')
  })

  test('should load file content in editor', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()

    const editor = page.locator('[data-testid="markdown-editor"]')
    const content = await editor.inputValue()

    expect(content).toBeTruthy()
    expect(content).toContain('---')
  })

  test('should edit content', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()

    const editor = page.locator('[data-testid="markdown-editor"]')
    await editor.fill('# Test Content\n\nThis is a test.')

    const content = await editor.inputValue()
    expect(content).toContain('Test Content')
  })

  test('should show save button when content changes', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()

    const editor = page.locator('[data-testid="markdown-editor"]')
    await editor.fill('# Modified')

    const saveBtn = page.getByRole('button', { name: /save/i })
    await expect(saveBtn).toBeVisible()
    await expect(saveBtn).toBeEnabled()
  })

  test('should prompt for commit message on save', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()

    const editor = page.locator('[data-testid="markdown-editor"]')
    await editor.fill('# Modified Content')

    const saveBtn = page.getByRole('button', { name: /save/i })
    await saveBtn.click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(/commit message/i)
  })

  test('should save content with commit message', async ({ page }) => {
    await page.route('**/api/github/file', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      })
    })

    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()

    const editor = page.locator('[data-testid="markdown-editor"]')
    await editor.fill('# Updated')

    await page.click('button[name="save"]')
    await page.fill('input[name="commit-message"]', 'Update content')
    await page.click('button[name="confirm-save"]')

    await expect(page.locator('.success-message')).toBeVisible()
  })
})
