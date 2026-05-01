import {
  expectAttribute,
  expectCount,
  expectText,
  expectVisible,
  test,
} from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('Markdown Preview', () => {
  test('the page-level Preview button is visible in edit mode', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')
    await expectVisible(page, page.locator('[data-testid="preview-button"]'))
  })

  test('clicking preview shows rendered HTML', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await editPage.togglePreview()
    await editPage.expectPreviewVisible()

    const preview = page.locator('[data-testid="markdown-preview"]')
    await expectVisible(page, preview.locator('h1'))
    await expectVisible(page, preview.locator('strong').first())
  })

  test('clicking toggle again returns to textarea', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await editPage.togglePreview()
    await editPage.expectPreviewVisible()

    await editPage.togglePreview()
    await editPage.expectEditorVisible()
  })

  test('headings and links render correctly', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.fill(
      '# Main Title\n\n## Subtitle\n\n[A link](https://example.com)\n\n- item 1\n- item 2'
    )

    await editPage.togglePreview()
    await editPage.expectPreviewVisible()

    const preview = page.locator('[data-testid="markdown-preview"]')
    await expectText(page, preview.locator('h1'), 'Main Title')
    await expectText(page, preview.locator('h2'), 'Subtitle')
    await expectAttribute(
      page,
      preview.locator('a'),
      'href',
      'https://example.com'
    )
    await expectCount(page, preview.locator('li'), 2)
  })
})
