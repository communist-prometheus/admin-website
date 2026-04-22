import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview } from './preview-save'

const navToPublishedBlog = async (
  page: import('@playwright/test').Page
): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('blog', 'welcome-to-prometheus')
}

const navToPage = async (
  page: import('@playwright/test').Page
): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('pages', 'manifest')
}

const dialog = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="publish-dialog"]')

const cancelBtn = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="publish-cancel-btn"]')

const confirmBtn = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="publish-confirm-btn"]')

test.describe('Publish confirm dialog', () => {
  test('publishing a blog opens the dialog', async ({ page }) => {
    await navToPublishedBlog(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible({ timeout: 5000 })
    await expect(confirmBtn(page)).toBeVisible()
    await expect(cancelBtn(page)).toBeVisible()
  })

  test('saving a page always opens the dialog (no draft mode)', async ({
    page,
  }) => {
    await navToPage(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible({ timeout: 5000 })
  })

  test('Cancel closes dialog and does not commit', async ({ page }) => {
    await navToPublishedBlog(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible()

    let commitFired = false
    page.on('response', r => {
      if (r.url().includes('/api/github/commit')) commitFired = true
    })
    await cancelBtn(page).click()
    await expect(dialog(page)).toBeHidden()
    // Preview footer is still on screen — user returns to Save + Back.
    await expect(page.locator('[data-testid="save-button"]')).toBeVisible()
    // No commit request was fired.
    await page.waitForTimeout(250)
    expect(commitFired).toBe(false)
  })

  test('Confirm triggers the save and preview auto-exits', async ({
    page,
  }) => {
    await navToPublishedBlog(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible()
    await confirmBtn(page).click()
    await expect(dialog(page)).toBeHidden()
    // After success the preview closes and the preview-button reappears.
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible({
      timeout: 15000,
    })
  })

  test('Esc key cancels the dialog', async ({ page }) => {
    await navToPublishedBlog(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog(page)).toBeHidden()
    await expect(page.locator('[data-testid="save-button"]')).toBeVisible()
  })

  test('click outside the dialog cancels it', async ({ page }) => {
    await navToPublishedBlog(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible()
    // The overlay is the section itself; click on it (avoiding the card).
    await dialog(page).click({ position: { x: 5, y: 5 } })
    await expect(dialog(page)).toBeHidden()
  })

  test('initial focus lands on Cancel (safer default)', async ({ page }) => {
    await navToPublishedBlog(page)
    await (await openPreview(page)).click()
    await expect(dialog(page)).toBeVisible()
    await expect(cancelBtn(page)).toBeFocused({ timeout: 2000 })
  })
})

test.describe('Publish confirm — draft content bypasses the dialog', () => {
  test('saving an unpublished blog draft does not open the dialog', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', 'welcome-to-prometheus')

    // Toggle the Published flag OFF in the editor, so this save becomes
    // a draft save (no publication event).
    const pub = page.locator('#fm-published')
    if (await pub.isChecked()) await pub.uncheck()

    await (await openPreview(page)).click()
    // Dialog must not appear — the save goes through immediately and the
    // preview auto-exits.
    await expect(dialog(page)).toBeHidden({ timeout: 1000 })
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible({
      timeout: 15000,
    })
  })
})
