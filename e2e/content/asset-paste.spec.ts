import { expect, test } from '@playwright/test'
import { login } from '../auth/helpers'
import { AssetManagerPage } from '../pages/AssetManagerPage'

const EDITOR = '[data-testid="editor-body"]'

const dispatchPaste = (page: import('@playwright/test').Page, name: string) =>
  page.evaluate(
    ({ selector, fileName }) =>
      new Promise<void>(resolve => {
        const canvas = document.createElement('canvas')
        canvas.width = 1
        canvas.height = 1
        canvas.toBlob(blob => {
          if (!blob) return resolve()
          const file = new File([blob], fileName, {
            type: 'image/png',
          })
          const dt = new DataTransfer()
          dt.items.add(file)
          const evt = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
          })
          Object.defineProperty(evt, 'clipboardData', {
            value: dt,
            writable: false,
          })
          document.querySelector(selector)?.dispatchEvent(evt)
          resolve()
        }, 'image/png')
      }),
    { selector: EDITOR, fileName: name }
  )

test.describe('Asset Paste Image', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should add pasted image to asset panel', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const initialCount = await am.getAssetCount()
    await am.getEditorBody().click()
    await dispatchPaste(page, 'test.png')

    await expect(am.getAssetThumbnails()).toHaveCount(initialCount + 1, {
      timeout: 10000,
    })
  })

  test('should insert markdown reference on paste', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToBlog('education-platform')
    await am.expectPanelVisible()

    const editor = am.getEditorBody()
    await editor.click()
    await dispatchPaste(page, 'screenshot.png')

    await expect(editor).toHaveValue(
      /!\[screenshot\.png\]\(\.\/assets\/screenshot\.png\)/,
      { timeout: 10000 }
    )
  })
})
