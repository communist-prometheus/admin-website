import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const edit = async (page: import('@playwright/test').Page): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('blog', 'welcome-to-prometheus')
}

const input = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="import-docs-input"]')

const button = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="import-docs-button"]')

test.describe('Import from Docs', () => {
  test('Import button is visible in the editor toolbar', async ({ page }) => {
    await edit(page)
    await expect(button(page)).toBeVisible()
    await expect(button(page)).toContainText(/import from docs/i)
  })

  test('upload a .md file inserts its body at the caret', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    // Empty the textarea first so the insertion is easy to spot.
    await textarea.fill('')

    const payload = Buffer.from('# Imported heading\n\nImported body text\n')
    await input(page).setInputFiles({
      name: 'doc.md',
      mimeType: 'text/markdown',
      buffer: payload,
    })

    // Wait for the content to land.
    await expect
      .poll(() => textarea.inputValue(), { timeout: 5000 })
      .toContain('Imported body text')
    expect(await textarea.inputValue()).toContain('# Imported heading')
  })

  test('upload an .html file converts to markdown', async ({ page }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill('')

    const payload = Buffer.from(
      '<h2>Html H2</h2><p><strong>bold</strong> <em>italic</em></p>'
    )
    await input(page).setInputFiles({
      name: 'doc.html',
      mimeType: 'text/html',
      buffer: payload,
    })

    await expect
      .poll(() => textarea.inputValue(), { timeout: 5000 })
      .toContain('## Html H2')
    const body = await textarea.inputValue()
    expect(body).toContain('**bold**')
    expect(body).toMatch(/(_|\*)italic(_|\*)/)
  })

  test('unsupported file type produces an error and leaves the body untouched', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    const before = await textarea.inputValue()

    await input(page).setInputFiles({
      name: 'doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    })

    // Wait a moment, then assert unchanged.
    await page.waitForTimeout(500)
    expect(await textarea.inputValue()).toBe(before)
    // The error path surfaces via the shared ErrorMessage banner.
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 2000,
    })
  })

  test('import is hidden while the user is on the preview page', async ({
    page,
  }) => {
    await edit(page)
    await page.locator('[data-testid="preview-button"]').click()
    await expect(button(page)).toBeHidden()
  })
})
