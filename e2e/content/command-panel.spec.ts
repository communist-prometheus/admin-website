import { expect, test } from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('Command Panel', () => {
  test('should display command panel with formatting buttons', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const panel = page.locator('[data-testid="command-panel"]')
    await expect(panel).toBeVisible()
    await expect(panel.locator('[data-testid="cmd-bold"]')).toBeVisible()
    await expect(panel.locator('[data-testid="cmd-italic"]')).toBeVisible()
  })

  test('should apply bold formatting to selected text', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.focus()
    await textarea.fill('hello world')
    await textarea.evaluate(el => {
      const ta = el as HTMLTextAreaElement
      ta.setSelectionRange(6, 11)
    })

    await page.locator('[data-testid="cmd-bold"]').click()

    await expect(textarea).toHaveValue('hello **world**')
  })

  test('should hide command panel in preview mode', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const panel = page.locator('[data-testid="command-panel"]')
    await expect(panel).toBeVisible()

    await editPage.togglePreview()
    await editPage.expectPreviewVisible()
    await expect(panel).not.toBeVisible()
  })
})
