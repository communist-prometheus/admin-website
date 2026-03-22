import { expect, test } from '@playwright/test'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Transactional Save', () => {
  test('should show save button with assets pending', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    const saveBtn = page.locator('[data-testid="save-button"]')
    await expect(saveBtn).toBeVisible({ timeout: 10000 })
  })

  test('should show upload button in asset panel', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectPanelVisible()

    await expect(am.getUploadAssetBtn()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should show cover and panel for all folder-based types', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')

    await am.expectCoverVisible()
    await am.expectPanelVisible()

    await page.goto('/content/positions/edit/digital-sovereignty', {
      waitUntil: 'domcontentloaded',
    })
    const body = page.locator('[data-testid="editor-body"]')
    await expect(body).toBeVisible({ timeout: 20000 })

    await expect(page.locator('[data-testid="cover-image"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="asset-panel"]')).toHaveCount(1)
  })
})
