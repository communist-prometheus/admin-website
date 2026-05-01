import { expect, expectVisible, test } from '@prometheus/e2e-toolkit'
import { openPreview, saveAndConfirm } from '../content/preview-save'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('GitHub Content - Edit', () => {
  test('should load file content in editor', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const content = await editPage.getEditorBody().inputValue()
    expect(content).toBeTruthy()
    expect(content.length).toBeGreaterThan(0)
  })

  test('should edit content in textarea', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()

    await textarea.fill('# Test Content\n\nThis is a test.')
    const content = await textarea.inputValue()
    expect(content).toContain('Test Content')
  })

  test('should show preview button on the edit page', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    await expectVisible(page, page.locator('[data-testid="preview-button"]'))
  })

  test('should save content with commit message via API', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.fill('# Updated via E2E test')

    await saveAndConfirm(page, await openPreview(page))

    /* Preview auto-closes after save; re-navigate and verify. */
    await expectVisible(page, page.locator('[data-testid="preview-button"]'))
    await editPage.navigate('blog', 'welcome-to-prometheus')
    const savedContent = await textarea.inputValue()
    expect(savedContent).toContain('Updated via E2E test')
  })
})
