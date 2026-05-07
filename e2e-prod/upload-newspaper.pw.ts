import 'dotenv/config'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { test } from '@prometheus/e2e-toolkit'

/*
 * "Do the real work" script: drives admin.comprom.org with a real
 * PAT to upload a magazine PDF onto the cp-1 newspaper issue and
 * link the published Russian articles to it. Streams console / SW
 * logs / network so any failure surfaces with a real cause.
 *
 * Not part of the regular test gate (lives under e2e-prod). Run with
 *   bunx playwright test --config playwright.config.prod.ts upload-newspaper
 */

const PAT = process.env.GITHUB_E2E_KEY ?? ''
const PDF_PATH = 'C:/Users/igor_/Downloads/Telegram Desktop/Magazine1 (3).pdf'
const TARGET = 'https://admin.comprom.org/content/newspaper/edit/cp-1?lang=ru'

test('upload Magazine1 PDF to cp-1, link RU articles', async ({
  browser,
}) => {
  test.setTimeout(360_000)
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

  const dropzone = page.locator('[data-testid="pdf-dropzone"]')
  const replaceBtn = page.locator('[data-testid="pdf-current"]')
  await Promise.race([
    dropzone.waitFor({ state: 'visible', timeout: 60_000 }),
    replaceBtn.waitFor({ state: 'visible', timeout: 60_000 }),
  ])

  out(`[probe] picking PDF ${PDF_PATH}`)
  const fileInput = page.locator('input[type="file"][accept*="pdf"]').first()
  await fileInput.setInputFiles(PDF_PATH)

  // Wait for cover extraction to populate the cover slot.
  const coverImg = page.locator('[data-testid="cover-image"] img')
  const coverFound = await coverImg
    .waitFor({ state: 'visible', timeout: 30_000 })
    .then(() => true)
    .catch(() => false)
  out(`[probe] cover visible: ${coverFound}`)

  // Inspect the article picker. Build a list of all option slugs so
  // we can call .add for each in turn and let the page reactively
  // hide the just-picked slug.
  const articleSelect = page
    .locator('select')
    .filter({ hasNot: page.locator('option[value="public-website"]') })
    .first()
  const optionValues = await articleSelect.evaluate(s => {
    const sel = s as HTMLSelectElement
    return [...sel.options].map(o => o.value).filter(v => v.length > 0)
  })
  out(`[probe] article options: ${JSON.stringify(optionValues)}`)

  for (const slug of optionValues) {
    out(`[probe] adding article ${slug}`)
    await articleSelect.selectOption(slug)
    await page.locator('button').filter({ hasText: /^Add$/ }).click()
    await page.waitForTimeout(200)
  }

  // Save via Preview → Save button.
  out('[probe] clicking Preview')
  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  out('[probe] clicking Save')
  await page.locator('[data-testid="save-button"]').click()

  const dialog = page.locator('[data-testid="publish-confirm-btn"]')
  const dialogVisible = await dialog
    .isVisible({ timeout: 3_000 })
    .catch(() => false)
  out(`[probe] dialog visible: ${dialogVisible}`)
  if (dialogVisible) {
    await dialog.click()
  }
  await page.waitForTimeout(20_000)

  const finalState = await page.evaluate(() => {
    const errorBanner = document
      .querySelector('.error-banner, [data-testid="error-banner"]')
      ?.textContent?.trim()
    return { errorBanner: errorBanner ?? null }
  })
  out(`[probe] final state: ${JSON.stringify(finalState)}`)
})
