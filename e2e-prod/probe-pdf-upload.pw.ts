import 'dotenv/config'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { test } from '@prometheus/e2e-toolkit'

/**
 * Investigation probe: PDF upload on dev. Drives dev-admin live with a
 * real PAT, navigates to a magazine edit page, and tries the full
 * upload chain (file picker → extractPdfCover → addAsset → save).
 * Streams console / SW logs / network so we can see exactly where it
 * breaks.
 */
const PAT = process.env.GITHUB_E2E_KEY ?? ''
const PDF_PATH =
  'C:/Projects/Prometheus/public-website/src/content/blog/demo-test-artiche/assets/pdf-sample_0 (1).pdf'
const TARGET = 'https://admin.comprom.org/content/magazine/edit/test-2'

test('probe: PDF upload on dev', async ({ browser }) => {
  test.setTimeout(180_000)
  if (!PAT) throw new Error('GITHUB_E2E_KEY required in .env')
  if (!existsSync(PDF_PATH))
    throw new Error(`PDF fixture missing: ${PDF_PATH}`)

  const ctx = await browser.newContext({ storageState: undefined })
  const page = await ctx.newPage()

  const out = (line: string): void => {
    process.stdout.write(`${line}\n`)
  }

  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') {
      out(`[console.${m.type()}] ${m.text().slice(0, 800)}`)
    }
  })
  page.on('pageerror', e => out(`[pageerror] ${e.message}\n${e.stack ?? ''}`))
  page.on('requestfailed', r =>
    out(
      `[reqfailed] ${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`
    )
  )

  await page.exposeFunction('__swLog', (entry: unknown) => {
    const e = entry as { level?: string; cat?: string; msg?: string }
    if (e.level === 'error' || e.level === 'warn')
      out(`[sw.${e.level}] ${e.cat ?? ''} ${e.msg ?? ''}`)
  })
  await page.addInitScript(() => {
    const ch = new BroadcastChannel('sw-logs')
    ch.onmessage = e =>
      (globalThis as unknown as { __swLog: (e: unknown) => void }).__swLog(
        e.data
      )
  })

  page.on('response', async r => {
    const u = r.url()
    if (!u.includes('/api/github/')) return
    const status = r.status()
    if (
      status >= 400 ||
      r.request().method() === 'POST' ||
      r.request().method() === 'PUT'
    ) {
      out(`[net] ${r.request().method()} ${u} → ${status}`)
      if (status >= 400) {
        const txt = await r.text().catch(() => '')
        out(`[net.body] ${txt.slice(0, 500)}`)
      }
    }
  })

  await page.goto('https://admin.comprom.org/', {
    waitUntil: 'domcontentloaded',
  })
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)

  await page.goto(TARGET, { waitUntil: 'domcontentloaded' })
  await page
    .locator('[data-testid="pdf-current"], [data-testid="pdf-dropzone"]')
    .first()
    .waitFor({ state: 'visible', timeout: 60_000 })

  // Probe the pdfjs vendor lib explicitly so we know whether it loads.
  // Wrapped in catch because the page may still be navigating when this
  // fires (SW registration trips a re-render); this is a diagnostic, not
  // a load-bearing assertion.
  const vendorCheck = await page
    .evaluate(async () => {
      try {
        const mod = await import('/vendor/pdf.min.mjs')
        return {
          ok: true,
          hasGetDocument: typeof mod.getDocument === 'function',
        }
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        }
      }
    })
    .catch(e => ({ ok: false, error: `evaluate failed: ${String(e)}` }))
  out(`[probe] pdfjs vendor: ${JSON.stringify(vendorCheck)}`)

  // Now drive the actual UI upload path.
  const fileInput = page.locator('input[type="file"][accept*="pdf"]').first()
  out(`[probe] picking PDF ${PDF_PATH}`)
  await fileInput.setInputFiles(PDF_PATH)

  await page.waitForTimeout(5_000)

  // Try the full save chain: Preview → Save → Confirm dialog.
  out('[probe] clicking Preview')
  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  out('[probe] clicking Save')
  await page.locator('[data-testid="save-button"]').click()
  // Magazine has its own publish gate (frontmatter.published). The
  // fixture probably doesn't set published=true, so no confirm dialog.
  // Wait either way.
  const dialog = page.locator('[data-testid="publish-confirm-btn"]')
  const dialogVisible = await dialog
    .isVisible({ timeout: 3_000 })
    .catch(() => false)
  out(`[probe] dialog visible: ${dialogVisible}`)
  if (dialogVisible) {
    out('[probe] confirming dialog')
    await dialog.click()
  }
  // Wait up to 30s for save chain (stage + commit).
  await page.waitForTimeout(15_000)

  // Inspect Vue reactive state via the document's pending-asset DOM.
  const state = await page.evaluate(() => {
    const items = [
      ...document.querySelectorAll('[data-testid^="asset-"]'),
    ].map(el => el.getAttribute('data-testid'))
    const pdfNameEl = document.querySelector('.pdf-name')
    const errorBanner = document
      .querySelector('.error-banner, [data-testid="error-banner"]')
      ?.textContent?.trim()
    return {
      pdfName: pdfNameEl?.textContent?.trim(),
      assetCount: items.length,
      errorBanner: errorBanner ?? null,
    }
  })
  out(`[probe] post-pick state: ${JSON.stringify(state)}`)
})
