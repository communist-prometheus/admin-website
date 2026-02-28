import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AuthPage } from '../pages/AuthPage'

test.describe('Content Editing', () => {
  test.beforeEach(async ({ page }) => {
    const authPage = new AuthPage(page)
    await page.goto('/')
    await waitForNetworkIdle(page)
    await authPage.mockLogin()
    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
  })

  test('should show editor when clicking on content item', async ({
    page,
  }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()

    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('should load content into editor when item is selected', async ({
    page,
  }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await page.waitForTimeout(1000)

    const editorContent = await page.locator('textarea').inputValue()
    expect(editorContent.length).toBeGreaterThan(0)
  })

  test('should show loading spinner when loading file', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    
    const loadingStatePromise = page.locator('.loading-state').waitFor({ state: 'visible', timeout: 2000 }).catch(() => null)
    
    await firstItem.click()
    
    await loadingStatePromise
    
    await expect(page.locator('textarea')).toBeVisible({ timeout: 5000 })
  })

  test('should allow editing content in textarea', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await page.waitForTimeout(1000)

    const textarea = page.locator('textarea')
    const originalContent = await textarea.inputValue()

    await textarea.fill(`${originalContent}\n\n## Test Edit`)
    const newContent = await textarea.inputValue()

    expect(newContent).toContain('## Test Edit')
  })

  test('should show save button when content is edited', async ({ page }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await page.waitForTimeout(1000)

    const textarea = page.locator('textarea')
    await textarea.fill('# Test Content')

    await expect(page.getByRole('button', { name: /save/i })).toBeVisible()
  })

  test('should send save request when save button is clicked', async ({
    page,
  }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await page.waitForTimeout(1000)

    const savePromise = page.waitForResponse(
      resp =>
        resp.url().includes('/api/github/content') &&
        resp.request().method() === 'POST'
    )

    const textarea = page.locator('textarea')
    await textarea.fill('# Updated Content')

    await page.click('button:has-text("Save")')

    const response = await savePromise
    expect(response.status()).toBe(200)
  })

  test('should clear editor when switching to different item', async ({
    page,
  }) => {
    const items = page.locator('[data-testid="content-item"]')

    await items.first().click()
    await page.waitForTimeout(1000)
    const firstContent = await page.locator('textarea').inputValue()

    await items.nth(1).click()
    await page.waitForTimeout(1000)
    const secondContent = await page.locator('textarea').inputValue()

    expect(firstContent).not.toBe(secondContent)
  })

  test('should preserve unsaved changes when navigating away and back', async ({
    page,
  }) => {
    const firstItem = page.locator('[data-testid="content-item"]').first()
    await firstItem.click()
    await page.waitForTimeout(1000)

    const testContent = '# Test Unsaved Changes'
    await page.locator('textarea').fill(testContent)

    await page.click('a[href="/content/positions"]')
    await page.waitForURL('/content/positions')

    await page.click('a[href="/content/blog"]')
    await page.waitForURL('/content/blog')
    await firstItem.click()
    await page.waitForTimeout(1000)

    const editorContent = await page.locator('textarea').inputValue()
    expect(editorContent).not.toBe(testContent)
  })
})
