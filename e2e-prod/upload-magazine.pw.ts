import 'dotenv/config'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { test } from '@prometheus/e2e-toolkit'

/*
 * "Do the real work" script: creates the magazine-1-mai-2026 RU
 * magazine issue on admin.comprom.org, uploads the magazine PDF,
 * links every published RU article that references this issue in
 * its frontmatter, and saves. Streams console / SW logs / network
 * so any failure surfaces with a real cause.
 *
 * Run with:
 *   bunx playwright test --config playwright.config.prod.ts upload-magazine
 */

const PAT = process.env.GITHUB_E2E_KEY ?? ''
const PDF_PATH = 'C:/Users/igor_/Downloads/Telegram Desktop/Magazine1 (3).pdf'
const SLUG = 'magazine-1-mai-2026'
const TITLE = 'Журнал «Коммунистический Прометей» №1 — май 2026'
const LANG = 'ru'
const ROOT = 'https://admin.comprom.org'

test('create magazine-1-mai-2026 (ru), upload PDF, link articles', async ({
  browser,
}) => {
  test.setTimeout(540_000)
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

  await page.goto(`${ROOT}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)

  // Try direct edit; if the file doesn't exist, fall back to the
  // create dialog. The list view's recent updates make navigation
  // round-trip through the SW which sometimes takes a moment, so we
  // give the editor a generous deadline before deciding.
  out('[probe] navigating to edit page directly')
  await page.goto(`${ROOT}/content/magazine/edit/${SLUG}`, {
    waitUntil: 'domcontentloaded',
  })
  const editorReady = page
    .locator('[data-testid="frontmatter-editor"]')
    .or(page.locator('[data-testid="markdown-editor"]'))
  const editorVisible = await editorReady
    .first()
    .isVisible({ timeout: 15_000 })
    .catch(() => false)

  if (!editorVisible) {
    out('[probe] edit page not ready — falling back to create flow')
    await page.goto(`${ROOT}/content/magazine?lang=${LANG}`, {
      waitUntil: 'domcontentloaded',
    })
    await page
      .locator('[data-testid="content-list"]')
      .waitFor({ state: 'visible', timeout: 30_000 })
    await page.locator('[data-testid="create-button"]').click()
    const dialog = page.locator('dialog.create-dialog')
    await dialog
      .waitFor({ state: 'visible', timeout: 12_000 })
      .catch(async () => {
        out('[probe] dialog not visible — force-show via JS')
        await page.evaluate(() => {
          const d = document.querySelector<HTMLDialogElement>(
            'dialog.create-dialog'
          )
          d?.showModal()
        })
        await dialog.waitFor({ state: 'visible', timeout: 5_000 })
      })
    await dialog.locator('#slug').fill(SLUG)
    await dialog.locator('#title').fill(TITLE)
    await dialog.locator('[data-testid="create-submit"]').click()
    await page.waitForURL(new RegExp(`/content/magazine/edit/${SLUG}`), {
      timeout: 15_000,
    })
  }
  out('[probe] on edit page')

  const ruTab = page.locator('[data-lang="ru"]')
  await ruTab.waitFor({ state: 'visible', timeout: 10_000 })
  await ruTab.click()
  await page.waitForTimeout(1_000)

  const titleInput = page.locator('#fm-title')
  await titleInput.waitFor({ state: 'visible', timeout: 10_000 })
  out(`[probe] Title field rendered`)

  // PDF UI is either pdf-dropzone (no PDF yet) or pdf-current
  // (replace existing). The hidden file input is present in both.
  const pdfReady = page
    .locator('[data-testid="pdf-dropzone"]')
    .or(page.locator('[data-testid="pdf-current"]'))
  await pdfReady.first().waitFor({ state: 'visible', timeout: 30_000 })
  out(`[probe] picking PDF ${PDF_PATH}`)
  const fileInput = page.locator('input[type="file"][accept*="pdf"]').first()
  await fileInput.setInputFiles(PDF_PATH)

  const coverImg = page.locator('[data-testid="cover-image"] img')
  await coverImg.waitFor({ state: 'visible', timeout: 30_000 })
  out('[probe] cover extracted + rendered')

  const publishedCheckbox = page.locator('#fm-published')
  const hasPublished = await publishedCheckbox
    .isVisible({ timeout: 2_000 })
    .catch(() => false)
  if (hasPublished) await publishedCheckbox.check()

  out('[probe] linking articles')
  const articleSelect = page.locator('[data-testid="article-add-select"]')
  const addBtn = page.locator('[data-testid="article-add"]')
  await articleSelect.waitFor({ state: 'visible', timeout: 10_000 })
  for (let i = 0; i < 30; i++) {
    const options = await articleSelect.evaluate(s =>
      [...(s as HTMLSelectElement).options]
        .map(o => o.value)
        .filter(v => v.length > 0)
    )
    if (options.length === 0) {
      out('[probe] no more articles to link')
      break
    }
    const slug = options[0]
    if (slug === undefined) break
    out(`[probe] adding article ${slug} (${options.length} remaining)`)
    await articleSelect.selectOption(slug)
    await addBtn.click()
    await page.waitForTimeout(300)
  }

  out('[probe] clicking Preview')
  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  out('[probe] clicking Save')
  await page.locator('[data-testid="save-button"]').click()

  const confirmBtn = page.locator('[data-testid="publish-confirm-btn"]')
  if (await confirmBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    out('[probe] confirming publish dialog')
    await confirmBtn.click()
  }

  out('[probe] waiting for save chain (stage + commit + push)')
  await page.waitForTimeout(30_000)

  const finalState = await page.evaluate(() => {
    const errorBanner = document
      .querySelector('.error-banner, [data-testid="error-banner"]')
      ?.textContent?.trim()
    return { errorBanner: errorBanner ?? null, url: location.href }
  })
  out(`[probe] final state: ${JSON.stringify(finalState)}`)
})
