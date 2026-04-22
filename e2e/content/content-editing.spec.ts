import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'
import { ContentEditPage } from '../pages/ContentEditPage'
import { ContentPage } from '../pages/ContentPage'
import { openPreview } from './preview-save'

test.describe('Content Editing', () => {
  test('should show refresh button that reloads content', async ({
    page,
  }) => {
    await page.goto('/content/blog')
    await waitForContentReady(page)

    const refreshBtn = page.locator('[data-testid="refresh-button"]')
    await refreshBtn.click()

    await page.waitForSelector('[data-testid="content-list"]', {
      state: 'visible',
      timeout: 20000,
    })
  })

  test('should navigate to edit page when clicking on content item', async ({
    page,
  }) => {
    const contentPage = new ContentPage(page)
    await contentPage.navigate('blog')
    await contentPage.selectItem('Welcome to Prometheus')

    await page.waitForURL(/\/content\/blog\/edit\/welcome-to-prometheus/, {
      timeout: 10000,
    })
    await expect(
      page.locator('[data-testid="markdown-editor"]')
    ).toBeVisible()
    await expect(page.locator('[data-testid="editor-body"]')).toBeVisible({
      timeout: 10000,
    })
  })

  test('should load content into editor when item is selected', async ({
    page,
  }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const editorContent = await editPage.getEditorBody().inputValue()
    expect(editorContent.length).toBeGreaterThan(0)
  })

  test('should allow editing content in textarea', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const textarea = editPage.getEditorBody()

    const originalContent = await textarea.inputValue()
    await textarea.fill(`${originalContent}\n\n## Test Edit`)
    const newContent = await textarea.inputValue()

    expect(newContent).toContain('## Test Edit')
  })

  test('should show preview button on the edit page', async ({ page }) => {
    const editPage = new ContentEditPage(page)
    await editPage.navigate('blog', 'welcome-to-prometheus')

    const previewBtn = page.locator('[data-testid="preview-button"]')
    await expect(previewBtn).toBeVisible()
  })

  test('should send save request', async ({ page }) => {
    await page.route('**/api/github/file**', async route => {
      if (route.request().method() === 'PUT') {
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
    await textarea.fill('# Updated Content')

    const saveBtn = await openPreview(page)
    await saveBtn.click()
  })
})
