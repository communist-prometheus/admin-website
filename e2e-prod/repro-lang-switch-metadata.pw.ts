import 'dotenv/config'
import process from 'node:process'
import { expect, type Page, test } from '@playwright/test'

/**
 * Red repro: switching to a language that has no file yet wipes the
 * frontmatter, which then makes Save fail validation
 * (`category is missing`, etc.).
 *
 * User flow:
 *   1. Open existing blog article (en file present)
 *   2. Switch to a lang where the file doesn't exist (it/es)
 *   3. Type body — frontmatter was wiped to {}
 *   4. Save → validation error: "category is missing"
 *
 * Expected: when switching to a missing lang the frontmatter inherits
 * from the previously-loaded language so Save succeeds — metadata is
 * an entity-level property, not per-file.
 */

const BRANCH = process.env['GITHUB_BRANCH'] ?? 'develop'

const TARGET_BASE =
  process.env['REPRO_BASE_URL'] ?? 'https://dev-admin.comprom.org'
const TARGET_PATH = '/content/blog/edit/demo-test-artiche'
const PAT = process.env['GITHUB_E2E_KEY'] ?? ''

const out = (s: string): void => {
  process.stdout.write(`${s}\n`)
}

const wireDialogs = (page: Page): void => {
  page.on('dialog', async d => {
    out(`[dialog.${d.type()}] ${d.message().slice(0, 500)}`)
    await d.dismiss().catch(() => undefined)
  })
}

test('repro: switching to lang without file must keep frontmatter', async ({
  page,
}) => {
  test.setTimeout(120_000)
  if (!PAT) throw new Error('GITHUB_E2E_KEY required in .env')
  wireDialogs(page)

  await page.goto(`${TARGET_BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)
  await page.goto(`${TARGET_BASE}${TARGET_PATH}`, {
    waitUntil: 'domcontentloaded',
  })

  // Wait for original (en) frontmatter to load.
  const titleInput = page.locator('#fm-title')
  await titleInput.waitFor({ state: 'visible', timeout: 60_000 })
  const titleBefore = await titleInput.inputValue()
  expect(titleBefore.length, 'en title must load').toBeGreaterThan(0)

  // Pick a language tab that the article does NOT have a file for.
  // The dev fixture has en + ru committed; it/es should be missing.
  const langTabs = page.locator(
    '[data-testid="language-selector"] [data-lang]'
  )
  const langs = await langTabs.evaluateAll(els =>
    els.map(e => e.getAttribute('data-lang'))
  )
  out(`available langs: ${JSON.stringify(langs)}`)

  const targetLang = langs.find(l => l && l !== 'en' && l !== 'ru') ?? 'it'

  await page
    .locator(`[data-testid="language-selector"] [data-lang="${targetLang}"]`)
    .click()

  // Wait for the language switch to settle (loadingFile flips off).
  await page.waitForFunction(
    () => {
      const el = document.querySelector(
        '[data-testid="loading-overlay"]'
      ) as HTMLElement | null
      return !el || el.style.display === 'none' || !el.offsetParent
    },
    undefined,
    { timeout: 15_000 }
  )

  const titleAfter = await titleInput.inputValue()
  out(`title before=${JSON.stringify(titleBefore.slice(0, 60))}`)
  out(`title after=${JSON.stringify(titleAfter.slice(0, 60))}`)

  // The metadata-as-entity assertion: switching to a lang with no
  // file must NOT erase the title (or any required frontmatter).
  expect(
    titleAfter,
    'frontmatter title must persist across language switch'
  ).not.toBe('')

  // Save must succeed for the new language too — type a body and save.
  const editor = page.locator('[data-testid="editor-body"]')
  const marker = `<!-- repro-lang-switch ${Date.now()} -->`
  await editor.fill(marker)

  const stagePuts: { readonly path: string; readonly status: number }[] = []
  const commits: { readonly status: number; readonly body: string }[] = []
  page.on('response', async r => {
    const u = r.url()
    if (
      u.includes('/api/github/file/stage') &&
      r.request().method() === 'PUT'
    ) {
      const post = (() => {
        try {
          return JSON.parse(r.request().postData() ?? '{}') as {
            path?: string
          }
        } catch {
          return {}
        }
      })()
      stagePuts.push({ path: post.path ?? '<no>', status: r.status() })
    }
    if (u.includes('/api/github/commit')) {
      commits.push({
        status: r.status(),
        body: (await r.text()).slice(0, 400),
      })
    }
  })

  await page.locator('[data-testid="preview-button"]').click()
  await page
    .locator('[data-testid="save-button"]')
    .waitFor({ state: 'visible', timeout: 10_000 })
  await page.locator('[data-testid="save-button"]').click()
  const confirm = page.locator('[data-testid="publish-confirm-btn"]')
  if (await confirm.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await confirm.click()
  }

  const ok = page.locator('[data-testid="preview-button"]')
  const errEl = page.locator('[data-testid="error-message"]')
  const winner = await Promise.race([
    ok.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'ok'),
    errEl.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'error'),
  ]).catch(() => 'timeout')
  out(`save winner: ${winner}`)
  for (const p of stagePuts) out(`stage ${p.status} ${p.path}`)
  for (const c of commits) out(`commit ${c.status} ${c.body}`)

  // Cleanup the file we just created (avoid polluting the dev branch).
  if (winner === 'ok' && stagePuts[0]?.path) {
    const path = stagePuts[0].path
    const url = `https://api.github.com/repos/communist-prometheus/public-website-content/contents/${path}?ref=${BRANCH}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${PAT}` },
    })
    if (res.ok) {
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
            message: `cleanup repro lang switch`,
            sha: data.sha,
            branch: BRANCH,
          }),
        }
      )
    }
  }

  expect(winner, 'save after lang switch must succeed').toBe('ok')
})
