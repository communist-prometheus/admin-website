import { expect, test } from '@playwright/test'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Panel - all file types', () => {
  test('should list all asset types with correct renderers', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    expect(await thumbs.count()).toBe(5)

    const names = await thumbs.evaluateAll(els =>
      els.map(e => e.getAttribute('data-name'))
    )
    expect(names).toContain('architecture.svg')
    expect(names).toContain('demo.mp4')
    expect(names).toContain('sample.m4a')
    expect(names).toContain('cover.jpg')
    expect(names).toContain('landscape.jpg')

    await expect(
      am.getThumbByName('architecture.svg').locator('img')
    ).toBeVisible()
    await expect(am.getThumbByName('demo.mp4').locator('video')).toBeVisible()
    await expect(
      am.getThumbByName('sample.m4a').locator('audio')
    ).toBeAttached()
  })

  test('should allow set-cover only on visual assets', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    // architecture.svg, demo.mp4, cover.jpg, landscape.jpg are visual
    // cover.jpg is already cover → 3 set-cover buttons
    expect(await am.getSetCoverBtns().count()).toBe(3)
  })
})
