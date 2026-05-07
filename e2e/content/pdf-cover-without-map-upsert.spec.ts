import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { expect, test } from '@prometheus/e2e-toolkit'

/*
 * Real-bug E2E for the prod incident on 2026-05-07: pdfjs 5.6.205
 * calls `this[#fr].getOrInsertComputed(...)` on its private font
 * registry. On engines that haven't shipped TC39 "Map upserts" the
 * upload throws "this[#fr].getOrInsertComputed is not a function".
 *
 * To reproduce that environment in CI's modern Chromium we use
 * `addInitScript` to delete the method from Map.prototype +
 * WeakMap.prototype BEFORE any application code runs. With the
 * polyfill in place the upload path reinstalls them itself and
 * cover extraction succeeds. Without the polyfill the test fails
 * with the exact prod error reaching the user's toast.
 */

const PDF_FIXTURE = resolve(
  'C:/Projects/Prometheus/public-website/src/content/blog/demo-test-artiche/assets/pdf-sample_0 (1).pdf'
)

test.describe('Newspaper — PDF cover when runtime lacks Map.getOrInsertComputed', () => {
  test('uploading a PDF still extracts the cover via the polyfill', async ({
    page,
  }) => {
    test.skip(!existsSync(PDF_FIXTURE), `PDF fixture missing: ${PDF_FIXTURE}`)
    test.setTimeout(60_000)

    /*
     * Strip the method on every navigation so the page boots into a
     * "Chrome <138" runtime. Anything the app does afterward — or any
     * library it loads dynamically — sees the missing method.
     */
    await page.addInitScript(() => {
      Reflect.deleteProperty(Map.prototype, 'getOrInsertComputed')
      Reflect.deleteProperty(WeakMap.prototype, 'getOrInsertComputed')
    })

    const errors: string[] = []
    page.on('pageerror', e => {
      errors.push(e.message)
      process.stderr.write(`[pageerror] ${e.message}\n`)
    })
    page.on('console', m => {
      if (m.type() === 'error') {
        errors.push(m.text())
        process.stderr.write(`[console.error] ${m.text().slice(0, 600)}\n`)
      }
    })

    const slug = `pdf-no-map-upsert-${Date.now()}`

    await page.goto('/content/newspaper', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('[data-testid="content-list"]')).toBeVisible({
      timeout: 20_000,
    })

    await page.locator('[data-testid="create-button"]').click()
    const dialog = page.locator('dialog.create-dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    await dialog.locator('#slug').fill(slug)
    await dialog.locator('#title').fill('cover-without-map-upsert')
    await dialog.locator('[data-testid="create-submit"]').click()

    await expect(page).toHaveURL(
      new RegExp(`/content/newspaper/edit/${slug}`),
      { timeout: 15_000 }
    )

    await expect(page.locator('#fm-title')).toBeVisible({ timeout: 15_000 })

    const fileInput = page
      .locator('input[type="file"][accept*="pdf"]')
      .first()
    await fileInput.setInputFiles(PDF_FIXTURE)

    const cover = page.locator('[data-testid="cover-image"] img').first()
    await expect(cover).toBeVisible({ timeout: 20_000 })
    const src = await cover.getAttribute('src')
    expect(src).toMatch(/^blob:/)

    const matchedTheBug = errors.some(e =>
      e.includes('getOrInsertComputed is not a function')
    )
    expect(matchedTheBug).toBe(false)
  })
})
