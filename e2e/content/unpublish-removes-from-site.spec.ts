import { expect, test } from '@prometheus/e2e-toolkit'
import { openPreview, saveAndConfirm } from './preview-save'

// Reproduction for the prod report: "I unchecked Publish on an article,
// it redeployed, but the article did NOT leave the public site."
//
// The public build only ships blog entries whose frontmatter has
// `published === true` (getBlogPosts + the [...slug] getStaticPaths
// filter). So an article leaves the live site precisely when the admin
// rewrites its frontmatter from `published: true` to `published: false`.
// This test drives the real editor: publish, then UNcheck Publish and
// save, and asserts the persisted markdown flips to `published: false`.
// If it stays `published: true`, the admin never unpublishes and the
// public site can never drop the article.

interface FileReadResult {
  readonly status: number
  readonly content?: string
}

const readFile = async (
  page: import('@playwright/test').Page,
  path: string
): Promise<FileReadResult> =>
  page.evaluate(async p => {
    const r = await fetch(`/api/github/file?path=${encodeURIComponent(p)}`)
    if (r.status !== 200) return { status: r.status }
    const data = (await r.json()) as { content: string }
    return { status: r.status, content: data.content }
  }, path)

const createPublishedArticle = async (
  page: import('@playwright/test').Page,
  slug: string
): Promise<void> => {
  await page.goto('/content/blog')
  await page.locator('[data-testid="create-button"]').click()
  await page.locator('input#slug').fill(slug)
  await page.locator('input#title').fill(`Unpublish ${slug}`)
  await page.locator('textarea#description').fill('unpublish-regression')
  const cat = page.locator('select#category').first()
  await expect
    .poll(() => cat.locator('option').count(), { timeout: 20000 })
    .toBeGreaterThan(1)
  await cat.selectOption({ index: 1 })
  await page.locator('[data-testid="create-submit"]').click()
  await page.waitForURL(new RegExp(`/edit/${slug}$`), { timeout: 15000 })
  await page
    .locator('[data-testid="frontmatter-editor"]')
    .waitFor({ state: 'visible', timeout: 10000 })
}

test.describe('Content - unchecking Publish removes article from site', () => {
  test.setTimeout(60000)

  test('unchecking Publish persists `published: false`', async ({ page }) => {
    const slug = `unpub-${Date.now()}`
    const file = `blog/${slug}/index.en.md`

    await createPublishedArticle(page, slug)

    // 1. Publish: check the box and save (publish-confirm dialog fires).
    await page.locator('#fm-published').check()
    await saveAndConfirm(page, await openPreview(page))

    await expect
      .poll(async () => (await readFile(page, file)).content, {
        timeout: 15000,
      })
      .toMatch(/^published:\s+true\s*$/m)

    // Reload the editor so the article comes back FROM THE SAVED FILE with
    // `published: true` — this is the real user path (open an already-
    // published article and unpublish it), exercising the load / draft-
    // cache restore that the in-session create path skips.
    await page.goto(`/content/blog/edit/${slug}`)
    await page
      .locator('[data-testid="frontmatter-editor"]')
      .waitFor({ state: 'visible', timeout: 10000 })
    await expect(page.locator('#fm-published')).toBeChecked()

    // 2. Unpublish: UNcheck the box and save again (no dialog — draft).
    await page.locator('#fm-published').uncheck()
    await saveAndConfirm(page, await openPreview(page))

    // The file must flip to `published: false` — otherwise the public
    // build keeps shipping the article and it never leaves the site.
    await expect
      .poll(async () => (await readFile(page, file)).content, {
        timeout: 15000,
      })
      .toMatch(/^published:\s+false\s*$/m)

    const final = await readFile(page, file)
    expect(final.content ?? '').not.toMatch(/^published:\s+true\s*$/m)
  })
})
