import { expect, test } from '@prometheus/e2e-toolkit'
import { AssetManagerPage } from '../pages/AssetManagerPage'

const ARCHIVE_SLUG = 'founding-documents'
const IMAGE_FILE = 'manifesto-poster.svg'
const DOC_FILE = 'notes.txt'

test.describe('Archive — download', () => {
  test('lists archive files with a download control each', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToEdit('archive', ARCHIVE_SLUG)
    await am.expectPanelVisible()

    const thumbs = am.getAssetThumbnails()
    await expect(thumbs.first()).toBeVisible({ timeout: 15000 })
    expect(await thumbs.count()).toBe(2)

    // Every file — image and non-image alike — offers a download.
    expect(await am.getDownloadAssetBtns().count()).toBe(2)
  })

  test('download control names each file accessibly', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToEdit('archive', ARCHIVE_SLUG)
    await am.expectPanelVisible()
    await expect(am.getAssetThumbnails().first()).toBeVisible({
      timeout: 15000,
    })

    await expect(
      page.getByRole('button', { name: `Download ${IMAGE_FILE}` })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: `Download ${DOC_FILE}` })
    ).toBeVisible()
  })

  test('non-image file shows a pictogram yet still downloads', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToEdit('archive', ARCHIVE_SLUG)
    await am.expectPanelVisible()

    const doc = am.getThumbByName(DOC_FILE)
    await expect(doc).toBeVisible({ timeout: 15000 })
    await expect(doc.locator('.file-icon')).toBeVisible()
    await expect(
      doc.locator('[data-testid="asset-download-btn"]')
    ).toBeVisible()
  })

  test('activating download saves the file under its name', async ({
    page,
  }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToEdit('archive', ARCHIVE_SLUG)
    await am.expectPanelVisible()
    await expect(am.getAssetThumbnails().first()).toBeVisible({
      timeout: 15000,
    })

    const started = page.waitForEvent('download')
    await page.getByRole('button', { name: `Download ${DOC_FILE}` }).click()
    const download = await started
    expect(download.suggestedFilename()).toBe(DOC_FILE)
  })
})
