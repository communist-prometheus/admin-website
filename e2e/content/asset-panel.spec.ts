import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Panel', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show asset panel for blog posts', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()
  })

  test('should list committed assets', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    expect(await thumbs.count()).toBe(2)
  })

  test('should show asset names', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    const names = await thumbs.evaluateAll(els =>
      els.map(e => e.getAttribute('data-name'))
    )
    expect(names).toContain('hero.svg')
    expect(names).toContain('banner.svg')
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

  test('should show delete button on each asset', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    const deleteBtns = am.getDeleteAssetBtns()
    expect(await deleteBtns.count()).toBe(2)
  })

  test('should mark asset as deleted when delete clicked', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    const delBtns = am.getDeleteAssetBtns()
    await delBtns.first().click()

    const deleted = page.locator(
      '[data-testid="asset-thumbnail"][data-status="pending-delete"]'
    )
    await expect(deleted).toHaveCount(1, { timeout: 5000 })
  })

  test('should not show asset panel for pages', async ({ page }) => {
    await page.goto('/content/pages/edit/manifest', {
      waitUntil: 'domcontentloaded',
    })
    const body = page.locator('[data-testid="editor-body"]')
    await expect(body).toBeVisible({ timeout: 20000 })

    const panel = page.locator('[data-testid="asset-panel"]')
    await expect(panel).toHaveCount(0)
  })

  test('should show set-as-cover button on non-cover assets', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    const setCoverBtns = am.getSetCoverBtns()
    expect(await setCoverBtns.count()).toBe(1)
  })

  test('should set asset as cover when button clicked', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    const setCoverBtn = am.getSetCoverBtns().first()
    await setCoverBtn.click()

    const badges = page.locator('[data-testid="asset-thumbnail"] .badge')
    await expect(badges).toHaveCount(1, { timeout: 5000 })
  })
})
