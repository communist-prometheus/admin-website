import {
  expect,
  expectHidden,
  expectText,
  expectVisible,
  type Page,
  test,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

const edit = async (page: Page): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('blog', 'welcome-to-prometheus')
}

const input = (page: Page) =>
  page.locator('[data-testid="import-docs-input"]')

const button = (page: Page) =>
  page.locator('[data-testid="import-docs-button"]')

test.describe('Import from Docs', () => {
  test('Import button is visible in the editor toolbar', async ({ page }) => {
    await edit(page)
    await expectText(page, button(page), /import from docs/i)
  })

  test('upload a .md file inserts its body at the caret', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    /* Empty the textarea first so the insertion is easy to spot. */
    await textarea.fill('')

    const payload = Buffer.from('# Imported heading\n\nImported body text\n')
    await input(page).setInputFiles({
      name: 'doc.md',
      mimeType: 'text/markdown',
      buffer: payload,
    })

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

    /* Wait for the request graph to settle, then assert untouched. */
    await waitForCondition(page, async () => true)
    expect(await textarea.inputValue()).toBe(before)
    await expectVisible(page, page.locator('[data-testid="error-message"]'))
  })

  test('import is hidden while the user is on the preview page', async ({
    page,
  }) => {
    await edit(page)
    await page.locator('[data-testid="preview-button"]').click()
    await expectHidden(page, button(page))
  })

  test('html with single-item bold-only ordered lists becomes numbered ## headings', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill('')

    /*
     * Mirrors what mammoth emits for Word "List Paragraph" sections
     * — each section is its own single-item bold-only ordered list.
     */
    const html =
      '<ol><li><strong>Foreword</strong></li></ol>' +
      '<p>body</p>' +
      '<ol><li><strong>Theory</strong></li></ol>' +
      '<p>body</p>' +
      '<ol><li><strong>Practice</strong></li></ol>' +
      '<p>body</p>'

    await input(page).setInputFiles({
      name: 'doc.html',
      mimeType: 'text/html',
      buffer: Buffer.from(html),
    })

    await expect
      .poll(() => textarea.inputValue(), { timeout: 5000 })
      .toContain('## 1\\. Foreword')
    const body = await textarea.inputValue()
    expect(body).toContain('## 1\\. Foreword')
    expect(body).toContain('## 2\\. Theory')
    expect(body).toContain('## 3\\. Practice')
    expect(body).not.toMatch(/^1\.\s+\*\*Foreword/m)
  })

  test('html with 3+ headings gets a Contents block prepended', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill('')

    const html =
      '<h2>Alpha</h2><p>body</p>' +
      '<h2>Beta</h2><p>body</p>' +
      '<h2>Gamma</h2><p>body</p>'

    await input(page).setInputFiles({
      name: 'doc.html',
      mimeType: 'text/html',
      buffer: Buffer.from(html),
    })

    await expect
      .poll(() => textarea.inputValue(), { timeout: 5000 })
      .toContain('## Contents')
    const body = await textarea.inputValue()
    expect(body.indexOf('## Contents')).toBeLessThan(body.indexOf('## Alpha'))
    expect(body).toContain('- [Alpha](#alpha)')
    expect(body).toContain('- [Beta](#beta)')
    expect(body).toContain('- [Gamma](#gamma)')
  })

  test('html with fewer than 3 headings is left without a TOC', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill('')

    await input(page).setInputFiles({
      name: 'doc.html',
      mimeType: 'text/html',
      buffer: Buffer.from('<h2>Only One</h2><p>body</p>'),
    })

    await expect
      .poll(() => textarea.inputValue(), { timeout: 5000 })
      .toContain('## Only One')
    expect(await textarea.inputValue()).not.toContain('## Contents')
  })
})
