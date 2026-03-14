import { expect, test } from '@playwright/test'
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

  test('should show commit message input and save button', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const commitInput = page.locator('input[placeholder="Commit message"]')
    await expect(commitInput).toBeVisible()

    const saveBtn = page.getByRole('button', {
      name: /save/i,
    })
    await expect(saveBtn).toBeVisible()
  })

  test('should save content with commit message via API', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.fill('# Updated via E2E test')

    const commitInput = page.locator('input[placeholder="Commit message"]')
    await commitInput.fill('test: e2e update')

    const saveBtn = page.getByRole('button', { name: /save/i })
    await saveBtn.click()

    // Verify save succeeded by reloading and checking content persisted
    await editPage.navigate('blog', 'welcome-to-prometheus')
    const savedContent = await textarea.inputValue()
    expect(savedContent).toContain('Updated via E2E test')
  })
})
