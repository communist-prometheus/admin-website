import { expect, test } from '@prometheus/e2e-toolkit'
import { AssetManagerPage } from '../pages/AssetManagerPage'

const ARCHIVE_SLUG = 'founding-documents'
const IMAGE_A = 'flag.svg' // first image (index 0)
const IMAGE_B = 'manifesto-poster.svg' // second image (index 1)
const DOC_FILE = 'notes.txt' // non-image (index 2)

const open = async (page: import('@playwright/test').Page, name: string) => {
  const am = new AssetManagerPage(page)
  await am.navigateToEdit('archive', ARCHIVE_SLUG)
  await am.expectPanelVisible()
  await expect(am.getAssetThumbnails().first()).toBeVisible({
    timeout: 15000,
  })
  await am.getViewBtnFor(name).click()
  await expect(page.getByTestId('file-viewer')).toBeVisible()
  return am
}

test.describe('Archive — viewer', () => {
  test('view control appears only on image files', async ({ page }) => {
    const am = new AssetManagerPage(page)
    await am.navigateToEdit('archive', ARCHIVE_SLUG)
    await am.expectPanelVisible()
    await expect(am.getAssetThumbnails().first()).toBeVisible({
      timeout: 15000,
    })
    // Two images get a view button; the .txt does not.
    expect(await am.getViewAssetBtns().count()).toBe(2)
    await expect(am.getViewBtnFor(DOC_FILE)).toHaveCount(0)
  })

  test('opens an image, closes on Escape and on the close button', async ({
    page,
  }) => {
    await open(page, IMAGE_B)
    await expect(page.getByTestId('file-viewer-image')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('file-viewer')).toBeHidden()

    await open(page, IMAGE_B)
    await page.getByTestId('file-viewer-close').click()
    await expect(page.getByTestId('file-viewer')).toBeHidden()
  })

  test('navigates with buttons and arrows, bounded at the ends', async ({
    page,
  }) => {
    await open(page, IMAGE_A) // index 0
    await expect(page.getByTestId('file-viewer-prev')).toBeDisabled()
    await expect(page.getByTestId('file-viewer-next')).toBeEnabled()

    // 0 -> 1 (image) -> 2 (the .txt, unsupported)
    await page.getByTestId('file-viewer-next').click()
    await expect(page.getByTestId('file-viewer-image')).toBeVisible()
    await page.getByTestId('file-viewer-next').click()
    await expect(page.getByTestId('file-viewer-unsupported')).toBeVisible()
    await expect(page.getByTestId('file-viewer-next')).toBeDisabled()

    // ArrowLeft returns to an image
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByTestId('file-viewer-image')).toBeVisible()
  })

  test('announces position in a live region', async ({ page }) => {
    await open(page, IMAGE_A)
    await expect(page.getByTestId('file-viewer-status')).toContainText(
      'File 1 of 3'
    )
    await page.getByTestId('file-viewer-next').click()
    await expect(page.getByTestId('file-viewer-status')).toContainText(
      'File 2 of 3'
    )
  })

  test('unsupported file downloads under its name from the viewer', async ({
    page,
  }) => {
    await open(page, IMAGE_B) // index 1
    await page.getByTestId('file-viewer-next').click() // -> notes.txt
    await expect(page.getByTestId('file-viewer-unsupported')).toBeVisible()

    const started = page.waitForEvent('download')
    await page.getByTestId('file-viewer-download').click()
    const download = await started
    expect(download.suggestedFilename()).toBe(DOC_FILE)
  })

  test('advances on a left-swipe', async ({ page }) => {
    await open(page, IMAGE_A) // index 0
    await expect(page.getByTestId('file-viewer-status')).toContainText(
      'File 1 of 3'
    )
    // Pointer events with explicit clientX — device-independent (mouse
    // emulation differs on touch contexts); start right, release left.
    const image = page.getByTestId('file-viewer-image')
    await image.dispatchEvent('pointerdown', { clientX: 300, clientY: 200 })
    await image.dispatchEvent('pointerup', { clientX: 90, clientY: 200 })
    await expect(page.getByTestId('file-viewer-status')).toContainText(
      'File 2 of 3'
    )
  })

  test('exposes an operable fullscreen control', async ({ page }) => {
    await open(page, IMAGE_A)
    const fs = page.getByTestId('file-viewer-fullscreen')
    await expect(fs).toHaveAttribute('aria-label', 'Enter fullscreen')
    // Clicking must not tear the viewer down (fullscreen itself is
    // environment-dependent in headless runs).
    await fs.click()
    await expect(page.getByTestId('file-viewer')).toBeVisible()
  })
})
