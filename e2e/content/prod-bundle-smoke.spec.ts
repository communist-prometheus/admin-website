import { expect, test } from '@playwright/test'

// Deploy-gate smoke test. Runs against a localhost preview of the
// already-rebuilt production bundle right before wrangler deploys,
// with the real GITHUB_E2E_KEY so the SW attempts a real push to the
// content repo. Catches the "mock-mode bundle accidentally deployed
// to prod" regression structurally: if `build:e2e` overwrites dist
// and the rebuild step after e2e is skipped or broken, the SW here
// runs in mock mode, returns `commit.sha === "mock"`, and this test
// fails loudly before wrangler pushes anything.
//
// Opt-in because it needs a real PAT and touches the content repo.
// Intentionally isolated to one branch (`smoke-{timestamp}`) with
// afterAll cleanup.
test.describe('Deploy smoke - prod bundle makes a real commit', () => {
  test.skip(
    process.env.PROD_SMOKE !== '1',
    'Set PROD_SMOKE=1 to run against a rebuilt local preview'
  )
  test.setTimeout(180000)

  const slug = `smoke-${Date.now()}`
  const pat = process.env.GITHUB_E2E_KEY ?? ''
  const owner = process.env.GITHUB_OWNER ?? 'communist-prometheus'
  const repo = process.env.GITHUB_REPO ?? 'public-website-content'
  const branch = process.env.GITHUB_BRANCH ?? 'master'

  test.afterAll(async () => {
    if (!pat) return
    const path = `blog/${slug}/index.en.md`
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers: { Authorization: `Bearer ${pat}` } }
    )
    if (!res.ok) return
    const data = (await res.json()) as { sha: string }
    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${pat}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `smoke: cleanup ${slug}`,
          sha: data.sha,
          branch,
        }),
      }
    )
  })

  test('SW commit goes through to GitHub, not mock', async ({ browser }) => {
    if (!pat) throw new Error('GITHUB_E2E_KEY required for smoke test')

    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')
    await page.evaluate(t => localStorage.setItem('gh_token', t), pat)
    await page.reload({ waitUntil: 'networkidle' })

    // Wait until the SW has cloned the content repo and is serving
    // real data. If it stays in 503 "SW not ready", the init failed
    // — most likely because the bundle is the mock-mode build.
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

    const response = await page.evaluate(
      async ({ slug }) => {
        const body = [
          '---',
          `title: Smoke ${slug}`,
          'lang: en',
          'description: deploy-gate smoke',
          'category: technology',
          'pubDate: 2026-04-13',
          '---',
          '',
          'smoke body',
          '',
        ].join('\n')
        const r = await fetch('/api/github/file', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            path: `blog/${slug}/index.en.md`,
            content: body,
            message: `smoke: prod bundle commit ${slug}`,
          }),
        })
        return { status: r.status, body: await r.text() }
      },
      { slug }
    )

    expect(response.status).toBe(200)
    // A mock-mode SW returns literally `"commit":{"sha":"mock"}`. The
    // real SW returns a 40-char SHA from isomorphic-git's git.commit.
    expect(response.body).not.toContain('"sha":"mock"')
    expect(response.body).toMatch(/"commit":\{"sha":"[0-9a-f]{40}"/)
  })
})
