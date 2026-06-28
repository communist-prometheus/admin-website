import { expect, test } from '@prometheus/e2e-toolkit'
import { acceptAltDialog } from '../helpers/auto-alt-dialog'
import { dispatchMediaPaste } from '../helpers/dispatch-paste'
import { AssetManagerPage } from '../pages/AssetManagerPage'

test.describe('Asset Paste Image', () => {
  test('should add pasted image to asset panel', async ({ page }) => {
    acceptAltDialog(page)
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    await am.getEditorBody().click()
    await dispatchMediaPaste(page, 'test.png', 'image/png')

    // Identity wait: the pasted asset renders its own data-name. A
    // relative count against getAssetCount() raced the committed-list
    // SW round-trip (baseline read as 0 mid-load, target settled at 6).
    await expect(am.getThumbByName('test.png')).toBeVisible()
  })

  test('should insert markdown reference on paste', async ({ page }) => {
    acceptAltDialog(page, 'screenshot description')
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('media-showcase')
    await am.expectPanelVisible()

    const editor = am.getEditorBody()
    await editor.click()
    await dispatchMediaPaste(page, 'screenshot.png', 'image/png')

    await expect(editor).toHaveValue(
      /!\[screenshot description\]\(\.\/assets\/screenshot\.png\)/,
      { timeout: 10000 }
    )
  })
})
