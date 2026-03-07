import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('Markdown Preview', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('preview toggle is visible in editor', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await expect(page.locator('[data-testid="preview-toggle"]')).toBeVisible()
  })

  test('clicking preview shows rendered HTML', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await editPage.togglePreview()
    await editPage.expectPreviewVisible()

    const preview = page.locator('[data-testid="markdown-preview"]')
    await expect(preview.locator('h1')).toBeVisible()
    await expect(preview.locator('strong').first()).toBeVisible()
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
    await expect(preview.locator('h1')).toHaveText('Main Title')
    await expect(preview.locator('h2')).toHaveText('Subtitle')
    await expect(preview.locator('a')).toHaveAttribute(
      'href',
      'https://example.com'
    )
    await expect(preview.locator('li')).toHaveCount(2)
  })
})
