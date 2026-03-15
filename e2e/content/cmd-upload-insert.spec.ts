import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

const SLUG = 'media-showcase'

test.describe('Upload Insert', () => {
  test('should insert media tag when file is uploaded via picker', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    const ta = ep.getEditorBody()
    await ta.focus()

    // Open the media picker dropdown
    await page.locator('[data-testid="media-picker"] button').click()

    // Click Upload... and handle file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.locator('.upload-btn').click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'uploaded-test.png',
      mimeType: 'image/png',
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    })

    await expect(ta).toHaveValue(
      /!\[uploaded-test\.png\]\(\.\/assets\/uploaded-test\.png\)/,
      { timeout: 10000 }
    )
  })
})
