import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Cover Image', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should show cover image for blog with image frontmatter', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectCoverVisible()

    const img = am.getCoverImage().locator('img')
    await expect(img).toBeVisible({ timeout: 15000 })
    const src = await img.getAttribute('src')
    expect(src).toBeTruthy()
    expect(src).toContain('blob:')
  })

  test('should show cover overlay buttons on hover', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectCoverVisible()

    await am.hoverCover()
    await expect(am.getCoverDeleteBtn()).toBeVisible({
      timeout: 5000,
    })
    await expect(am.getCoverUploadBtn()).toBeVisible({
      timeout: 5000,
    })
  })

  test('should remove cover on delete click', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('welcome-to-prometheus')
    await am.expectCoverVisible()

    await am.hoverCover()
    await am.getCoverDeleteBtn().click()

    const noCover = am.getCoverImage().locator('.no-cover')
    await expect(noCover).toBeVisible({ timeout: 5000 })
  })

  test('should not show cover for non-blog content', async ({ page }) => {
    await page.goto('/content/pages/edit/manifest', {
      waitUntil: 'domcontentloaded',
    })
    const body = page.locator('[data-testid="editor-body"]')
    await expect(body).toBeVisible({ timeout: 20000 })

    const cover = page.locator('[data-testid="cover-image"]')
    await expect(cover).toHaveCount(0)
  })

  test('should show no-cover text for blog without image', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectCoverVisible()

    const noCover = am.getCoverImage().locator('.no-cover')
    await expect(noCover).toBeVisible({ timeout: 5000 })
  })
})
