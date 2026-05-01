import 'dotenv/config'
import process from 'node:process'
import { expect, type Page, test } from '@prometheus/e2e-toolkit'

/**
 * Red repro: full create-then-save flow against dev-admin.
 *
 * The plain edit save passed (`repro-save-broken.pw.ts`), so we widen
 * coverage to the path the user said is also broken: creating a new
 * blog article and saving it. We assert:
 *   1. Stage PUT lands with 200
 *   2. Commit POST lands with 200
 *   3. The page returns to edit mode (preview-button visible) and no
 *      "Save failed" / "Commit failed" banner appears.
 *
 * Cleans up the article on the content repo afterwards.
 */

const TARGET_BASE =
  process.env['REPRO_BASE_URL'] ?? 'https://dev-admin.comprom.org'
const PAT = process.env['GITHUB_E2E_KEY'] ?? ''
const BRANCH = process.env['GITHUB_BRANCH'] ?? 'develop'
const SLUG = `repro-create-${Date.now()}`

interface Capture {
  readonly stagePuts: { readonly path: string; readonly status: number }[]
  readonly commits: { readonly status: number; readonly body: string }[]
}

const out = (s: string): void => {
  process.stdout.write(`${s}\n`)
}

const wireCapture = (page: Page): Capture => {
  const cap: Capture = { stagePuts: [], commits: [] }
  page.on('response', async r => {
    const u = r.url()
    const m = r.request().method()
    if (u.includes('/api/github/')) {
      out(`[net] ${m} ${u} → ${r.status()}`)
    }
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
      cap.stagePuts.push({ path: post.path ?? '<no>', status: r.status() })
    }
    if (u.includes('/api/github/commit')) {
      const body = await r.text().catch(() => '')
      cap.commits.push({ status: r.status(), body: body.slice(0, 800) })
    }
  })
  page.on('requestfailed', r =>
    out(
      `[reqfailed] ${r.method()} ${r.url()} ${r.failure()?.errorText ?? ''}`
    )
  )
  page.on('console', m => {
    if (m.type() === 'error' || m.type() === 'warning') {
      out(`[console.${m.type()}] ${m.text().slice(0, 500)}`)
    }
  })
  page.on('pageerror', e => out(`[pageerror] ${e.message}`))
  page.on('dialog', async d => {
    out(`[dialog.${d.type()}] ${d.message().slice(0, 500)}`)
    await d.dismiss().catch(() => undefined)
  })
  return cap
}

const cleanup = async (slug: string): Promise<void> => {
  const path = `blog/${slug}/index.en.md`
  const url = `https://api.github.com/repos/communist-prometheus/public-website-content/contents/${path}?ref=${BRANCH}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${PAT}` },
  })
  if (!res.ok) return
  const data = (await res.json()) as { sha: string }
  await fetch(
    `https://api.github.com/repos/communist-prometheus/public-website-content/contents/${path}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `cleanup repro ${slug}`,
        sha: data.sha,
        branch: BRANCH,
      }),
    }
  )
}

test.afterAll(async () => {
  if (PAT) await cleanup(SLUG)
})

test('repro: blog create then save must succeed', async ({ page }) => {
  test.setTimeout(180_000)
  if (!PAT) throw new Error('GITHUB_E2E_KEY required in .env')

  const cap = wireCapture(page)

  await page.goto(`${TARGET_BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)

  await page.goto(`${TARGET_BASE}/content/blog`, {
    waitUntil: 'domcontentloaded',
  })

  const createBtn = page.locator('[data-testid="create-button"]')
  await createBtn.waitFor({ state: 'visible', timeout: 30_000 })

  // Wait for auth hydration: ContentViewMain swallows the create event
  // when isAuthenticated is false. The header shows the avatar once auth
  // resolves.
  await page.waitForFunction(
    () => {
      const a = document.querySelector(
        '[data-testid="user-avatar"], .user-avatar, header [src*="githubusercontent"]'
      )
      return !!a
    },
    undefined,
    { timeout: 30_000 }
  )

  await createBtn.click()
  await page.locator('.create-dialog[open]').waitFor({ state: 'attached' })
  out(`[step] dialog open url=${page.url()}`)
  await page.locator('#slug').fill(SLUG)
  await page.locator('#title').fill(`Repro ${SLUG}`)
  const desc = page.locator('#description')
  if (await desc.count()) await desc.fill('repro description')
  const cat = page.locator('#category')
  if (await cat.count()) {
    const opts = await cat.locator('option').allTextContents()
    out(`[step] category options: ${JSON.stringify(opts)}`)
    // Pick first non-disabled value
    const values = await cat.locator('option').evaluateAll(els =>
      els.map(e => ({
        value: (e as HTMLOptionElement).value,
        disabled: (e as HTMLOptionElement).disabled,
      }))
    )
    const firstReal = values.find(v => v.value && !v.disabled)
    if (firstReal) await cat.selectOption(firstReal.value)
  }

  await page.locator('[data-testid="create-submit"]').click()
  out(`[step] create submitted, waiting for editor`)

  const editor = page.locator('[data-testid="editor-body"]')
  await editor.waitFor({ state: 'visible', timeout: 60_000 })
  out(`[step] editor visible url=${page.url()}`)

  await editor.fill(`# Repro ${SLUG}\n\nHello world.`)

  out(`[step] clicking preview`)
  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  out(`[step] clicking save url=${page.url()}`)
  await page.locator('[data-testid="save-button"]').click()

  const confirm = page.locator('[data-testid="publish-confirm-btn"]')
  if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) {
    out(`[step] confirming publish dialog`)
    await confirm.click()
  } else {
    out(`[step] no publish dialog`)
  }

  const ok = page.locator('[data-testid="preview-button"]')
  const errEl = page.locator('[data-testid="error-message"]')
  const winner = await Promise.race([
    ok.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'ok'),
    errEl.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'error'),
  ]).catch(() => 'timeout')

  out(`=== REPRO CREATE RESULT ===`)
  out(`winner: ${winner}`)
  out(`stage PUTs: ${cap.stagePuts.length}`)
  for (const p of cap.stagePuts) out(`     ${p.status} ${p.path}`)
  out(`commit responses: ${cap.commits.length}`)
  for (const c of cap.commits)
    out(`     status=${c.status} body=${c.body.slice(0, 400)}`)

  if (winner !== 'ok') {
    const errText = await errEl
      .innerText({ timeout: 1000 })
      .catch(() => '<no error message>')
    out(`error-message text: ${errText}`)
  }

  expect(winner).toBe('ok')
  expect(cap.stagePuts.length).toBeGreaterThan(0)
  for (const p of cap.stagePuts) expect(p.status).toBeLessThan(400)
  for (const c of cap.commits)
    expect(c.status, `commit body=${c.body}`).toBeLessThan(400)
})
