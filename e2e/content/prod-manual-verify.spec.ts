import { expect, type Page, test } from '@playwright/test'

// Manual verification probe run against the real prod admin. Inject
// GITHUB_E2E_KEY, walk through every critical flow the user cares
// about, and report a PASS/FAIL per story. This file exists outside
// the normal e2e suite (skipped unless PROD_VERIFY=1) because it
// touches the real content repo.

const ADMIN = 'https://admin.comprom.org'
const PAT = process.env.GITHUB_E2E_KEY ?? ''
// Slug max length is 20 chars per validateSlug. Use a short prefix
// so the renamed variant fits too.
const SLUG = `pv-${Date.now().toString().slice(-12)}`

type Outcome = 'PASS' | 'FAIL'
interface Result {
  readonly id: string
  readonly story: string
  readonly outcome: Outcome
  readonly note?: string
}
const results: Result[] = []

const record = (
  id: string,
  story: string,
  outcome: Outcome,
  note?: string
): void => {
  results.push({ id, story, outcome, note })
  process.stdout.write(
    `[${outcome}] ${id} ${story}${note ? ` — ${note}` : ''}\n`
  )
}

const runStep = async (
  id: string,
  story: string,
  fn: () => Promise<void>
): Promise<void> => {
  try {
    await fn()
    record(id, story, 'PASS')
  } catch (e) {
    const msg = e instanceof Error ? e.message.slice(0, 200) : String(e)
    record(id, story, 'FAIL', msg)
  }
}

const injectToken = async (page: Page): Promise<void> => {
  await page.goto(ADMIN)
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)
  await page.reload({ waitUntil: 'networkidle' })
  // Wait until SW has cloned the repo
  await expect
    .poll(
      async () =>
        await page.evaluate(async () => {
          const r = await fetch('/api/github/content/blog')
          return r.status
        }),
      { timeout: 60000 }
    )
    .toBe(200)
}

test.describe('Prod manual verify', () => {
  test.skip(
    process.env.PROD_VERIFY !== '1',
    'Set PROD_VERIFY=1 to run against admin.comprom.org'
  )
  test.setTimeout(300000)

  test('walk through all critical user stories', async ({ browser }) => {
    if (!PAT) throw new Error('GITHUB_E2E_KEY required')
    const ctx = await browser.newContext({ storageState: undefined })
    const page = await ctx.newPage()

    // U-001..U-006: auth via injected PAT (OAuth popup not testable here)
    await runStep(
      'U-003-ish',
      'Session restores from localStorage token',
      async () => {
        await injectToken(page)
        const user = await page.evaluate(() =>
          localStorage.getItem('gh_user_profile')
        )
        if (!user) throw new Error('no cached profile after token set')
      }
    )

    // U-100: navigate content types
    for (const type of ['blog', 'pages', 'positions', 'common'] as const) {
      await runStep(`U-100/${type}`, `List ${type}`, async () => {
        await page.goto(`${ADMIN}/content/${type}`, {
          waitUntil: 'networkidle',
        })
        await page
          .locator('[data-testid="content-list"]')
          .waitFor({ state: 'visible', timeout: 10000 })
      })
    }

    // U-200..U-207: create dialog + frontmatter roundtrip
    await runStep('U-200', 'Create dialog opens on blog', async () => {
      await page.goto(`${ADMIN}/content/blog`, { waitUntil: 'networkidle' })
      await page.locator('[data-testid="create-button"]').click()
      await page
        .locator('input#slug')
        .waitFor({ state: 'visible', timeout: 5000 })
    })

    await runStep('U-201', 'Dialog shows blog fields', async () => {
      await expect(page.locator('input#title')).toBeVisible()
      await expect(page.locator('textarea#description')).toBeVisible()
      await expect(page.locator('select#category')).toBeVisible()
    })

    await runStep(
      'U-203',
      'Successful create redirects + SW push',
      async () => {
        await page.locator('input#slug').fill(SLUG)
        await page.locator('input#title').fill(`Prod Verify ${SLUG}`)
        await page.locator('textarea#description').fill('prod verify desc')
        const cat = page.locator('select#category').first()
        await expect
          .poll(() => cat.locator('option').count(), { timeout: 20000 })
          .toBeGreaterThan(1)
        await cat.selectOption({ index: 1 })
        // Create uses POST /api/github/file (not /api/github/commit —
        // that's only for the edit→save transactional flow).
        const createPromise = page.waitForResponse(
          r =>
            r.url().includes('/api/github/file') &&
            !r.url().includes('/stage') &&
            r.request().method() === 'POST',
          { timeout: 30000 }
        )
        await page.locator('[data-testid="create-submit"]').click()
        await page.waitForURL(new RegExp(`/edit/${SLUG}$`), {
          timeout: 30000,
        })
        const createResp = await createPromise
        const body = await createResp.text()
        if (!/"staged":true/.test(body))
          throw new Error(`bad create body: ${body.slice(0, 120)}`)
      }
    )

    // U-300: editor loads frontmatter + body (the regression fix)
    await runStep('U-300', 'Editor loads frontmatter editor', async () => {
      await page
        .locator('[data-testid="frontmatter-editor"]')
        .waitFor({ state: 'visible', timeout: 15000 })
      await expect(page.locator('#fm-title')).toHaveValue(
        `Prod Verify ${SLUG}`
      )
      await expect(page.locator('#fm-description')).toHaveValue(
        'prod verify desc'
      )
    })

    await runStep('U-302', 'Save with body edit reaches GitHub', async () => {
      const body = page.locator('[data-testid="editor-body"]')
      await body.focus()
      await body.press('End')
      await body.type('\n\nbody edit from prod verify')
      const commitPromise = page.waitForResponse(
        r =>
          r.url().includes('/api/github/commit') &&
          r.request().method() === 'POST',
        { timeout: 30000 }
      )
      await page.locator('[data-testid="save-button"]').click()
      const commitResp = await commitPromise
      const text = await commitResp.text()
      if (!/"sha":"[0-9a-f]{40}"/.test(text))
        throw new Error(`save commit body: ${text.slice(0, 120)}`)
      // Wait push to reach GitHub, then verify
      await page.waitForTimeout(3000)
      const gh = await fetch(
        `https://api.github.com/repos/communist-prometheus/public-website-content/contents/blog/${SLUG}/index.en.md?ref=master`,
        { headers: { Authorization: `Bearer ${PAT}` } }
      )
      const data = (await gh.json()) as { content: string }
      const fileContent = Buffer.from(data.content, 'base64').toString('utf8')
      if (!fileContent.includes('body edit from prod verify'))
        throw new Error('body edit not on GitHub')
      if (!fileContent.includes(`title: Prod Verify ${SLUG}`))
        throw new Error('frontmatter title missing on GitHub')
      if (!fileContent.includes('description: prod verify desc'))
        throw new Error('frontmatter description missing')
      if (!/category:\s+\S+/.test(fileContent))
        throw new Error('frontmatter category missing')
    })

    // U-400..U-403: language selector
    await runStep('U-400', 'Language selector visible', async () => {
      await expect(
        page
          .locator('[data-testid="language-selector"], .language-selector')
          .first()
      ).toBeVisible()
    })

    // U-304: rename slug — click on [data-testid="edit-title"] to open
    // the EditableSlug input, type new slug, Enter.
    // Max slug = 20 chars. `pv-…-rn` still fits within 20.
    const RENAMED = `${SLUG}-rn`
    await runStep('U-304', 'Rename slug redirects to new URL', async () => {
      await page.locator('[data-testid="edit-title"]').first().click()
      const input = page.locator('[data-testid="slug-input"]')
      await input.waitFor({ state: 'visible', timeout: 5000 })
      await input.clear()
      await input.type(RENAMED, { delay: 20 })
      await input.press('Enter')
      await page.waitForURL(new RegExp(`/edit/${RENAMED}$`), {
        timeout: 30000,
      })
    })

    // U-500/U-501: delete dialog via UI. ContentListItem renders the
    // title, not the slug, so filter by the title text. Also force a
    // hard reload of /content/blog so the pinia store picks up the
    // renamed item from a fresh SW call (vs the cached list from the
    // previous load).
    await runStep('U-501', 'Delete confirmation dialog', async () => {
      await page.goto(`${ADMIN}/content/blog`, { waitUntil: 'networkidle' })
      await page.reload({ waitUntil: 'networkidle' })
      const item = page
        .locator('[data-testid="content-item"]')
        .filter({ hasText: `Prod Verify ${SLUG}` })
        .first()
      await item.waitFor({ state: 'visible', timeout: 15000 })
      await item.hover()
      const delBtn = item.locator('[data-testid="delete-item-btn"]').first()
      await delBtn.click()
      await page
        .locator('[data-testid="delete-dialog"]')
        .waitFor({ state: 'visible', timeout: 5000 })
      // Immediately cancel to avoid touching production content; the
      // test-created file is cleaned up by API afterwards.
      await page.locator('[data-testid="delete-cancel-btn"]').click()
    })

    // Close dialog, manual cleanup via API
    await page.keyboard.press('Escape').catch(() => undefined)

    // Manual cleanup
    const cleanupPath = `blog/${RENAMED}/index.en.md`
    const cur = await fetch(
      `https://api.github.com/repos/communist-prometheus/public-website-content/contents/${cleanupPath}?ref=master`,
      { headers: { Authorization: `Bearer ${PAT}` } }
    )
    if (cur.ok) {
      const d = (await cur.json()) as { sha: string }
      await fetch(
        `https://api.github.com/repos/communist-prometheus/public-website-content/contents/${cleanupPath}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${PAT}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `cleanup prod-verify ${RENAMED}`,
            sha: d.sha,
            branch: 'master',
          }),
        }
      )
    }

    // U-800: settings page
    await runStep(
      'U-800',
      'Settings page loads languages editor',
      async () => {
        await page.goto(`${ADMIN}/settings`, { waitUntil: 'networkidle' })
        await page
          .locator('[data-testid="languages-editor"]')
          .waitFor({ state: 'visible', timeout: 10000 })
      }
    )

    process.stdout.write('\n=== PROD VERIFY SUMMARY ===\n')
    for (const r of results) {
      process.stdout.write(
        `${r.outcome === 'PASS' ? '✓' : '✗'} ${r.id}  ${r.story}${
          r.note ? ` — ${r.note}` : ''
        }\n`
      )
    }
    const failed = results.filter(r => r.outcome === 'FAIL').length
    process.stdout.write(
      `\n${results.length - failed}/${results.length} passed, ${failed} failed\n`
    )
    expect(failed).toBe(0)
  })
})
