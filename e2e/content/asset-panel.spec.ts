import { expect, test } from '@playwright/test'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Panel', () => {
  test('should show panel and list committed assets with names', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    expect(await thumbs.count()).toBe(1)

    const names = await thumbs.evaluateAll(els =>
      els.map(e => e.getAttribute('data-name'))
    )
    expect(names).toContain('hero.svg')
  })

  test('should mark cover asset with badge', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    const coverThumb = thumbs.filter({
      has: page.locator('.badge'),
    })
    expect(await coverThumb.count()).toBe(1)
  })

  test('should show delete and set-cover buttons', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    expect(await am.getDeleteAssetBtns().count()).toBe(1)
    expect(await am.getSetCoverBtns().count()).toBe(0)
  })

  test('should mark asset as deleted when delete clicked', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    await am.getDeleteAssetBtns().first().click()

    const deleted = page.locator(
      '[data-testid="asset-thumbnail"][data-status="pending-delete"]'
    )
    await expect(deleted).toHaveCount(1, { timeout: 5000 })
  })

  test('should show asset panel for pages', async ({ page }) => {
    await page.goto('/content/pages/edit/manifest', {
      waitUntil: 'domcontentloaded',
    })
    const body = page.locator('[data-testid="editor-body"]')
    await expect(body).toBeVisible({ timeout: 20000 })

    const panel = page.locator('[data-testid="asset-panel"]')
    await expect(panel).toHaveCount(1)
  })

  test('should set asset as cover when button clicked', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    await am.getSetCoverBtns().first().click()

    const badges = page.locator('[data-testid="asset-thumbnail"] .badge')
    await expect(badges).toHaveCount(1, { timeout: 5000 })
  })
})
