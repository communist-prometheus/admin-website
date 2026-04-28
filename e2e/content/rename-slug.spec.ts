import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
import { AssetManagerPage } from '../pages/AssetManagerPage'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview, saveAndConfirm } from './preview-save'

const SLUG = 'media-showcase'

test.describe('Rename Slug', () => {
  test('should show slug input on click and validate', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await expect(input).toBeVisible({ timeout: 5000 })

    // Sanitization strips non-[a-z0-9-]; "!!!" reduces to "" so the
    // validator fires its empty-slug error.
    await input.clear()
    await input.type('!!!', { delay: 30 })
    await input.press('Enter')
    await expect(page.locator('[data-testid="slug-error"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('lowercases uppercase keystrokes on the fly', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('FooBar', { delay: 30 })
    await expect(input).toHaveValue('foobar')
  })

  test('strips non-Latin keystrokes', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('пост-test', { delay: 30 })
    await expect(input).toHaveValue('-test')
  })

  test('should reject slug exceeding max length', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('a'.repeat(21), { delay: 10 })
    await input.press('Enter')
    await expect(page.locator('[data-testid="slug-error"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('should cancel edit on Escape', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await expect(input).toBeVisible()

    await input.press('Escape')
    await expect(input).not.toBeVisible()
    await expect(page.locator('[data-testid="edit-title"]')).toBeVisible()
  })

  test('valid rename should redirect to new URL', async ({ page }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('showcase-renamed', { delay: 30 })
    await input.press('Enter')

    await page.waitForURL(/showcase-renamed/, { timeout: 15000 })
  })

  test('rename preserves assets and content', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog(SLUG)
    await am.expectPanelVisible()
    const assetCount = await am.getAssetCount()

    const ep = new ContentEditPage(page)
    const bodyBefore = await ep.getEditorBody().inputValue()

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('renamed-showcase', { delay: 30 })
    await input.press('Enter')
    await page.waitForURL(/renamed-showcase/, { timeout: 15000 })

    // Wait for page to fully load after location.replace
    await expect(ep.getEditorBody()).toBeVisible({ timeout: 20000 })
    await expect(ep.getEditorBody()).not.toHaveValue('', {
      timeout: 20000,
    })

    const bodyAfter = await ep.getEditorBody().inputValue()
    expect(bodyAfter).toBe(bodyBefore)

    await expect(am.getAssetThumbnails()).toHaveCount(assetCount, {
      timeout: 10000,
    })
  })

  test('rename + save does not create duplicate articles', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    await page.locator('[data-testid="edit-title"]').click()
    const input = page.locator('[data-testid="slug-input"]')
    await input.clear()
    await input.type('showcase-save', { delay: 30 })
    await input.press('Enter')
    await page.waitForURL(/showcase-save/, { timeout: 15000 })

    await expect(ep.getEditorBody()).toBeVisible({ timeout: 20000 })
    await expect(ep.getEditorBody()).not.toHaveValue('', {
      timeout: 20000,
    })

    // Save
    await saveAndConfirm(page, await openPreview(page))
    await waitForNetworkIdle(page, { idleTime: 1000 })

    // Navigate back to list
    await page.locator('[data-testid="back-button"]').click()
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible({
      timeout: 10000,
    })

    // Count items with "Rich Media" title (should be exactly 1)
    const items = page.locator('[data-testid="content-item"]')
    const count = await items.count()
    let richMediaCount = 0
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).innerText()
      if (text.includes('Rich Media')) richMediaCount++
    }
    expect(richMediaCount).toBe(1)
  })
})
