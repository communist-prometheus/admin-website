import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview, saveAndConfirm } from './preview-save'

const edit = async (page: import('@playwright/test').Page): Promise<void> => {
  const ep = new ContentEditPage(page)
  await ep.navigate('blog', 'welcome-to-prometheus')
}

const errorBanner = (page: import('@playwright/test').Page) =>
  page.locator('[data-testid="error-message"]')

test.describe('Frontmatter validation before save', () => {
  test('clearing the title blocks the save and surfaces an error', async ({
    page,
  }) => {
    await edit(page)
    await page.locator('#fm-title').fill('')

    // Intercept the commit endpoint — it must not fire.
    let commitFired = false
    page.on('response', r => {
      if (r.url().includes('/api/github/commit')) commitFired = true
    })

    await saveAndConfirm(page, await openPreview(page))
    await expect(errorBanner(page)).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(250)
    expect(commitFired).toBe(false)
  })

  test('clearing the description blocks the save', async ({ page }) => {
    await edit(page)
    await page.locator('#fm-description').fill('')

    let commitFired = false
    page.on('response', r => {
      if (r.url().includes('/api/github/commit')) commitFired = true
    })

    await saveAndConfirm(page, await openPreview(page))
    await expect(errorBanner(page)).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(250)
    expect(commitFired).toBe(false)
  })

  test('valid frontmatter allows the save to complete', async ({ page }) => {
    await edit(page)
    // Make a trivial dirty change so there's something to save.
    const textarea = page.locator('[data-testid="editor-body"]')
    await textarea.fill(`${await textarea.inputValue()}\nvalid`)

    await saveAndConfirm(page, await openPreview(page))
    await expect(errorBanner(page)).toBeHidden({ timeout: 2000 })
    // Preview auto-exits on success.
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible({
      timeout: 15000,
    })
  })
})

test.describe('Per-type validation', () => {
  test('pages also gets validated — missing title blocks save', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('pages', 'manifest')
    await page.locator('#fm-title').fill('')

    let commitFired = false
    page.on('response', r => {
      if (r.url().includes('/api/github/commit')) commitFired = true
    })

    await saveAndConfirm(page, await openPreview(page))
    await expect(errorBanner(page)).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(250)
    expect(commitFired).toBe(false)
  })
})
