import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const edit = async (page: import('@playwright/test').Page): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('blog', 'welcome-to-prometheus')
}

const preview = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="preview-button"]')

const contentPreview = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="content-preview"]')

test.describe('Preview-before-save flow', () => {
  test('edit page has Preview button, no Save button', async ({ page }) => {
    await edit(page)
    await expect(preview(page)).toBeVisible()
    await expect(preview(page)).toHaveText(/preview/i)
    // The Save button only exists on the preview page, not the edit page.
    await expect(page.locator('[data-testid="save-button"]')).toHaveCount(0)
  })

  test('clicking Preview renders ContentPreview with frontmatter', async ({
    page,
  }) => {
    await edit(page)
    await preview(page).click()
    await expect(contentPreview(page)).toBeVisible()
    // Title from frontmatter is rendered in the preview header.
    await expect(contentPreview(page).locator('h1').first()).toContainText(
      /welcome/i
    )
    // Save + Back buttons appear in the PreviewFooter.
    await expect(page.locator('[data-testid="save-button"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="back-to-edit-button"]')
    ).toBeVisible()
    // The edit-mode textarea is hidden.
    await expect(page.locator('[data-testid="editor-body"]')).toBeHidden()
  })

  test('Back returns to edit mode and preserves unsaved changes', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    const addition = '\n\n<!-- preview-back-roundtrip -->'
    await textarea.fill((await textarea.inputValue()) + addition)

    await preview(page).click()
    await expect(contentPreview(page)).toBeVisible()
    await page.locator('[data-testid="back-to-edit-button"]').click()

    // Back on the edit page — preview-button is visible again.
    await expect(preview(page)).toBeVisible()
    await expect(textarea).toBeVisible()
    expect(await textarea.inputValue()).toContain(
      '<!-- preview-back-roundtrip -->'
    )
  })

  test('preview renders the current editor body, not the saved version', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    const marker = 'PREVIEW_LIVE_MARKER_ABC'
    await textarea.fill(`# Live edit\n\n${marker}`)
    await preview(page).click()
    await expect(contentPreview(page)).toContainText(marker)
  })

  test('save button on preview is enabled and shows "Save"', async ({
    page,
  }) => {
    await edit(page)
    await preview(page).click()
    const save = page.locator('[data-testid="save-button"]')
    await expect(save).toBeEnabled()
    await expect(save).toContainText(/save/i)
  })

  test('leaving the edit page with unsaved changes prompts the guard', async ({
    page,
  }) => {
    await edit(page)
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill(`${await textarea.inputValue()}\nmore`)

    // `useUnsavedGuard` hooks onBeforeRouteLeave and calls
    // globalThis.confirm(). Return false → navigation cancelled;
    // URL must remain on the edit page.
    page.on('dialog', async d => {
      await d.dismiss()
    })
    await page.locator('[data-testid="back-button"]').click()
    await page.waitForTimeout(250)
    // We cancelled the guard — still on the edit page.
    expect(page.url()).toMatch(/\/content\/blog\/edit\/welcome-to-prometheus/)
  })
})
