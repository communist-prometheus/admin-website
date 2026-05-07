import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { expect, test } from '@prometheus/e2e-toolkit'

/*
 * Reproducer for the reported "PDF cover doesn't take when uploading"
 * bug on /content/newspaper. Drives the create-new flow end-to-end
 * in mock-auth mode:
 *   1. Navigate to /content/newspaper
 *   2. Click + New, fill the slug, submit
 *   3. Land on the edit page, find the PDF dropzone
 *   4. Pick a real PDF file from disk
 *   5. Wait for cover extraction (pdfjs first-page render → blob → File)
 *   6. Assert the cover image element is populated with a blob: URL
 *      and the cover.png asset is in the asset list
 *
 * If pdfjs / canvas / the upload chain fail, this test fails with a
 * concrete signal — not a silent no-op like the production symptom.
 */

const PDF_FIXTURE = resolve(
  'C:/Projects/Prometheus/public-website/src/content/blog/demo-test-artiche/assets/pdf-sample_0 (1).pdf'
)

test.describe('Newspaper — PDF cover auto-extraction', () => {
  test('uploading a PDF auto-extracts the first page as cover', async ({
    page,
  }) => {
    test.skip(!existsSync(PDF_FIXTURE), `PDF fixture missing: ${PDF_FIXTURE}`)
    test.setTimeout(60_000)

    page.on('pageerror', e => {
      process.stderr.write(`[pageerror] ${e.message}\n${e.stack ?? ''}\n`)
    })
    page.on('console', m => {
      if (m.type() === 'error') {
        process.stderr.write(`[console.error] ${m.text().slice(0, 800)}\n`)
      }
    })

    const slug = `pdf-cover-test-${Date.now()}`

    await page.goto('/content/newspaper', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible({
      timeout: 20_000,
    })

    await page.locator('[data-testid="create-button"]').click()

    const dialog = page.locator('dialog.create-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    await dialog.locator('#slug').fill(slug)
    await dialog.locator('#title').fill('PDF cover test issue')
    await dialog.locator('[data-testid="create-submit"]').click()

    await expect(page).toHaveURL(
      new RegExp(`/content/newspaper/edit/${slug}`),
      {
        timeout: 15_000,
      }
    )

    const dropzone = page.locator('[data-testid="pdf-dropzone"]')
    await expect(dropzone).toBeVisible({ timeout: 15_000 })

    const fileInput = page
      .locator('input[type="file"][accept*="pdf"]')
      .first()
    await fileInput.setInputFiles(PDF_FIXTURE)

    // Cover extraction: pdfjs renders → File → addAsset → coverPath.
    // The resulting cover-image element should display a blob URL.
    const cover = page.locator('[data-testid="cover-image"] img')
    await expect(cover).toBeVisible({ timeout: 15_000 })
    const src = await cover.getAttribute('src')
    expect(src).toBeTruthy()
    expect(src).toMatch(/^blob:/)

    // The asset panel should list cover.png alongside the uploaded PDF.
    const assetPanel = page.locator('[data-testid="asset-panel"]')
    await expect(assetPanel.locator('text=cover.png')).toBeVisible({
      timeout: 5_000,
    })
  })
})
