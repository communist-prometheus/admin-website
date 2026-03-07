import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { ContentEditPage } from '../pages/ContentEditPage'

test.describe('GitHub Content - Edit', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

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
    let capturedRequest: { content: string; message: string } | undefined

    await page.route('**/api/github/file**', async route => {
      if (route.request().method() === 'PUT') {
        capturedRequest = route.request().postDataJSON()
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      } else {
        await route.continue()
      }
    })

    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()
    await textarea.fill('# Updated via E2E test')

    const commitInput = page.locator('input[placeholder="Commit message"]')
    await commitInput.fill('test: e2e update')

    await page.getByRole('button', { name: /save/i }).click()

    expect(capturedRequest).toBeDefined()
    expect(capturedRequest?.message).toBe('test: e2e update')
  })
})
