import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Panel - all file types', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should list all asset types including non-media', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    expect(await thumbs.count()).toBe(4)

    const names = await thumbs.evaluateAll(els =>
      els.map(e => e.getAttribute('data-name'))
    )
    expect(names).toContain('logo.svg')
    expect(names).toContain('intro.mp4')
    expect(names).toContain('narration.mp3')
    expect(names).toContain('syllabus.pdf')
  })

  test('should render image thumbnail for SVG', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const svgThumb = am.getThumbByName('logo.svg')
    await expect(svgThumb).toBeVisible({ timeout: 15000 })
    await expect(svgThumb.locator('img')).toBeVisible()
  })

  test('should render video element for MP4', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const videoThumb = am.getThumbByName('intro.mp4')
    await expect(videoThumb).toBeVisible({ timeout: 15000 })
    await expect(videoThumb.locator('video')).toBeVisible()
  })

  test('should render audio element for MP3', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const audioThumb = am.getThumbByName('narration.mp3')
    await expect(audioThumb).toBeVisible({ timeout: 15000 })
    await expect(audioThumb.locator('audio')).toBeAttached()
  })

  test('should render file icon for PDF', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const pdfThumb = am.getThumbByName('syllabus.pdf')
    await expect(pdfThumb).toBeVisible({ timeout: 15000 })
    await expect(pdfThumb.locator('.file-icon')).toBeVisible()
  })

  test('should allow set-cover only on visual assets', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    const setCoverBtns = am.getSetCoverBtns()
    const count = await setCoverBtns.count()
    // Only logo.svg (image) and intro.mp4 (video) are visual
    expect(count).toBe(2)
  })

  test('should show delete button on all asset types', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })

    const deleteBtns = am.getDeleteAssetBtns()
    expect(await deleteBtns.count()).toBe(4)
  })
})
