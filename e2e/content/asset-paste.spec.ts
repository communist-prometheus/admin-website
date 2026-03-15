import { expect, test } from '@playwright/test'
import { dispatchMediaPaste } from '../helpers/dispatch-paste'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Paste Image', () => {
  test('should add pasted image to asset panel', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    const initialCount = await am.getAssetCount()
    await am.getEditorBody().click()
    await dispatchMediaPaste(page, 'test.png', 'image/png')

    await expect(am.getAssetThumbnails()).toHaveCount(initialCount + 1, {
      timeout: 10000,
    })
  })

  test('should insert markdown reference on paste', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    const editor = am.getEditorBody()
    await editor.click()
    await dispatchMediaPaste(page, 'screenshot.png', 'image/png')

    await expect(editor).toHaveValue(
      /!\[screenshot\.png\]\(\.\/assets\/screenshot\.png\)/,
      { timeout: 10000 }
    )
  })
})
