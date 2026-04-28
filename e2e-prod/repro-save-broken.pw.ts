import 'dotenv/config'
import process from 'node:process'
import { expect, type Page, test } from '@playwright/test'

/**
 * Red repro: edit save fails on dev-admin (and prod-admin).
 *
 * Drives the full save chain end-to-end: open existing article, type a
 * marker into the body, Preview → Save → Confirm. The test asserts the
 * Save dialog does NOT show an error and the page returns to edit mode.
 * With the bug present, the dialog stays on screen with the underlying
 * isomorphic-git reason (now visible thanks to PR #58).
 *
 * The captured error string is logged so we can diagnose without
 * guessing.
 */

const TARGET_BASE =
  process.env['REPRO_BASE_URL'] ?? 'https://dev-admin.comprom.org'
const TARGET_PATH = '/content/blog/edit/demo-test-artiche'
const PAT = process.env['GITHUB_E2E_KEY'] ?? ''

interface Capture {
  readonly stagePuts: { readonly path: string; readonly status: number }[]
  readonly commits: {
    readonly status: number
    readonly body: string
  }[]
  errorBanner: string | undefined
}

const out = (s: string): void => {
  process.stdout.write(`${s}\n`)
}

const wireCapture = (page: Page): Capture => {
  const cap: Capture = {
    stagePuts: [],
    commits: [],
    errorBanner: undefined,
  }
  page.on('response', async r => {
    const u = r.url()
    const m = r.request().method()
    if (u.includes('/api/github/file/stage') && m === 'PUT') {
      const post = (() => {
        try {
          return JSON.parse(r.request().postData() ?? '{}') as {
            path?: string
          }
        } catch {
          return {}
        }
      })()
      cap.stagePuts.push({
        path: post.path ?? '<no path>',
        status: r.status(),
      })
    }
    if (u.includes('/api/github/commit')) {
      const body = await r.text().catch(() => '')
      cap.commits.push({ status: r.status(), body: body.slice(0, 1000) })
    }
  })
  page.on('console', m => {
    if (m.type() === 'error') {
      out(`[console.error] ${m.text().slice(0, 500)}`)
    }
  })
  page.on('pageerror', e => {
    out(`[pageerror] ${e.message}`)
  })
  return cap
}

test('repro: blog edit save must succeed', async ({ page }) => {
  test.setTimeout(120_000)
  if (!PAT) throw new Error('GITHUB_E2E_KEY required in .env')

  const cap = wireCapture(page)

  await page.goto(`${TARGET_BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)
  await page.goto(`${TARGET_BASE}${TARGET_PATH}`, {
    waitUntil: 'domcontentloaded',
  })

  const editor = page.locator('[data-testid="editor-body"]')
  await editor.waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForFunction(
    () => {
      const ta = document.querySelector(
        '[data-testid="editor-body"]'
      ) as HTMLTextAreaElement | null
      return !!ta && ta.value.length > 0
    },
    undefined,
    { timeout: 60_000 }
  )

  const before = await editor.inputValue()
  const marker = `<!-- repro-save-broken ${Date.now()} -->`
  await editor.fill(`${before}\n\n${marker}`)

  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  await page.locator('[data-testid="save-button"]').click()

  const confirm = page.locator('[data-testid="publish-confirm-btn"]')
  const hasConfirm = await confirm
    .isVisible({ timeout: 3_000 })
    .catch(() => false)
  if (hasConfirm) await confirm.click()

  // Wait for either: success (preview-button reappears) or error
  // (.save-error or alert-style dialog containing "failed").
  const ok = page.locator('[data-testid="preview-button"]')
  const errBanner = page
    .locator('text=/Save failed|Commit failed|RPC failed/i')
    .first()

  const winner = await Promise.race([
    ok.waitFor({ state: 'visible', timeout: 90_000 }).then(() => 'ok'),
    errBanner
      .waitFor({ state: 'visible', timeout: 90_000 })
      .then(() => 'error'),
  ]).catch(() => 'timeout')

  if (winner !== 'ok') {
    cap.errorBanner = await errBanner
      .innerText()
      .catch(() => '<no banner text>')
  }

  out(`=== REPRO RESULT ===`)
  out(`winner: ${winner}`)
  out(`stage PUTs: ${cap.stagePuts.length}`)
  for (const p of cap.stagePuts) out(`     ${p.status} ${p.path}`)
  out(`commit responses: ${cap.commits.length}`)
  for (const c of cap.commits)
    out(`     status=${c.status} body=${c.body.slice(0, 400)}`)
  if (cap.errorBanner) out(`errorBanner: ${cap.errorBanner}`)

  expect(winner, 'save chain must complete without error dialog').toBe('ok')
  for (const c of cap.commits) {
    expect(c.status, `commit response body=${c.body}`).toBeLessThan(400)
  }
})
