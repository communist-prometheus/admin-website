import 'dotenv/config'
import { mkdirSync } from 'node:fs'
import process from 'node:process'
import type { Page } from '@prometheus/e2e-toolkit'
import { expect, test } from '@prometheus/e2e-toolkit'

/**
 * Manual prod verification for issues #36, #37, #38.
 *
 * Drives https://admin.comprom.org/content/pages/edit/manifest end to
 * end: switch to ru, edit body, Preview → Save → Confirm. Captures
 * the stage PUT path, deploy-bar visibility, sessionStorage pending
 * deploy, and the home dashboard.
 *
 * Requires GITHUB_E2E_KEY in .env (used as the localStorage gh_token).
 */
const PROD = 'https://admin.comprom.org'
const SHOTS = 'screenshots/prod-verify-39'

mkdirSync(SHOTS, { recursive: true })

const out = (s: string): void => {
  process.stdout.write(`${s}\n`)
}

interface Capture {
  readonly stagePuts: { readonly path: string }[]
  readonly commitResps: { readonly status: number; readonly body: string }[]
}

const recordStage = (cap: Capture, postData: string | undefined): void => {
  try {
    const post = JSON.parse(postData ?? '{}') as { path?: string }
    if (post.path) cap.stagePuts.push({ path: post.path })
  } catch {
    /* ignore */
  }
}

const recordCommit = async (
  cap: Capture,
  status: number,
  body: Promise<string>
): Promise<void> => {
  cap.commitResps.push({ status, body: (await body.catch(() => '')) ?? '' })
}

const wireCapture = (page: Page): Capture => {
  const cap: Capture = { stagePuts: [], commitResps: [] }
  page.on('response', async r => {
    const url = r.url()
    const isStage =
      url.includes('/api/github/file/stage') && r.request().method() === 'PUT'
    const isCommit = url.includes('/api/github/commit')
    if (isStage) recordStage(cap, r.request().postData() ?? undefined)
    if (isCommit) await recordCommit(cap, r.status(), r.text())
  })
  return cap
}

test('prod: manifest+ru save lands on ru, deploy-bar appears', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const token = process.env['GITHUB_E2E_KEY']
  if (!token) throw new Error('Set GITHUB_E2E_KEY in .env')

  const cap = wireCapture(page)

  await page.goto(`${PROD}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(t => localStorage.setItem('gh_token', t), token)
  await page.goto(`${PROD}/content/pages/edit/manifest`, {
    waitUntil: 'domcontentloaded',
  })

  const editor = page.locator('[data-testid="editor-body"]')
  await editor.waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForFunction(
    () => {
      const ta = document.querySelector(
        '[data-testid="editor-body"]'
      ) as HTMLTextAreaElement | null
      return !!ta && ta.value.length > 10
    },
    undefined,
    { timeout: 60_000 }
  )
  await page.screenshot({
    path: `${SHOTS}/01-manifest-en.png`,
    fullPage: true,
  })

  // #36: in-editor preview-toggle is gone.
  const toggleCount = await page
    .locator('[data-testid="preview-toggle"]')
    .count()
  expect(toggleCount).toBe(0)

  await page
    .locator('[data-testid="language-selector"] [data-lang="ru"]')
    .click()
  await page.waitForFunction(
    () => {
      const ta = document.querySelector(
        '[data-testid="editor-body"]'
      ) as HTMLTextAreaElement | null
      return !!ta && /Наш|манифест/u.test(ta.value)
    },
    undefined,
    { timeout: 30_000 }
  )
  await page.screenshot({
    path: `${SHOTS}/02-manifest-ru.png`,
    fullPage: true,
  })

  const before = await editor.inputValue()
  const marker = `<!-- prod-verify-39 ${Date.now()} -->`
  await editor.fill(`${before}\n\n${marker}`)

  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  await page.screenshot({
    path: `${SHOTS}/03-preview-mode.png`,
    fullPage: true,
  })

  await page.locator('[data-testid="save-button"]').click()
  await page
    .locator('[data-testid="publish-confirm-btn"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  await page.screenshot({
    path: `${SHOTS}/04-confirm.png`,
    fullPage: true,
  })

  await page.locator('[data-testid="publish-confirm-btn"]').click()

  // Wait for save to land — preview-button reappears in edit mode.
  await page
    .locator('[data-testid="preview-button"]')
    .waitFor({ state: 'visible', timeout: 120_000 })
  await page.screenshot({
    path: `${SHOTS}/05-after-save.png`,
    fullPage: true,
  })

  const deployBarVisible = await page
    .locator('.deploy-bar')
    .isVisible({ timeout: 5_000 })
    .catch(() => false)
  const deployBarClass = await page
    .locator('.deploy-bar')
    .getAttribute('class')
    .catch(() => '')
  const pending = await page.evaluate(() =>
    sessionStorage.getItem('pending_deploy')
  )

  await page.goto(`${PROD}/`, { waitUntil: 'domcontentloaded' })
  await page
    .locator('section.deploy-list')
    .waitFor({ state: 'visible', timeout: 30_000 })
    .catch(() => undefined)
  await page.screenshot({ path: `${SHOTS}/06-home.png`, fullPage: true })
  const homeHTML = await page
    .locator('section.deploy-list')
    .innerHTML()
    .catch(() => '<not found>')

  out('=== PROD VERIFY RESULT ===')
  out(`#36 preview-toggle count: ${toggleCount}`)
  out(`#37 stage PUTs: ${cap.stagePuts.length}`)
  for (const p of cap.stagePuts) out(`     ${p.path}`)
  out(`#37 commit responses: ${cap.commitResps.length}`)
  for (const c of cap.commitResps)
    out(`     status=${c.status} body=${c.body.slice(0, 200)}`)
  out(`#38 deploy-bar visible: ${deployBarVisible}`)
  out(`#38 deploy-bar class: ${deployBarClass}`)
  out(`#38 pending_deploy: ${pending}`)
  out(`#38 home first 600 chars: ${homeHTML.slice(0, 600)}`)
})
