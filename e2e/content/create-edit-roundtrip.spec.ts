import { expect, test } from '@playwright/test'
import { openPreview } from './preview-save'

// Regression test for "creating article wipes frontmatter on next save":
// the create→edit handover used to leave the pinia content store stale, so
// the edit page's availableLanguages set did not include the new slug,
// initEditor skipped loadLanguageVersion, frontmatterData stayed empty,
// and the first save stringified `---\n\n---\n...body` — wiping every
// field that had been set in the create dialog. The prod Astro build then
// rejected the commit because title/description/category/pubDate/lang
// are all required by the blog schema.

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

test.describe('Content - create → edit round-trip', () => {
  test.setTimeout(60000)

  test('frontmatter survives editing the body right after create', async ({
    page,
  }) => {
    const slug = `rt-${Date.now()}`
    const title = `Roundtrip ${slug}`
    const description = 'regression-roundtrip-description'

    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    await page.locator('[data-testid="create-button"]').click()
    await page.locator('input#slug').fill(slug)
    await page.locator('input#title').fill(title)
    await page.locator('textarea#description').fill(description)

    const categorySelect = page.locator('select#category').first()
    await expect
      .poll(() => categorySelect.locator('option').count(), {
        timeout: 20000,
      })
      .toBeGreaterThan(1)
    await categorySelect.selectOption({ index: 1 })

    const submit = page.locator('[data-testid="create-submit"]')
    await submit.click()

    // Must land on the edit page with a real frontmatter editor, not a
    // blank form. Before the fix this locator timed out because the pinia
    // content store was still stale and initEditor skipped the load.
    await page.waitForURL(new RegExp(`/edit/${slug}$`), { timeout: 15000 })
    await page
      .locator('[data-testid="frontmatter-editor"]')
      .waitFor({ state: 'visible', timeout: 10000 })

    // Verify each required blog field is bound in the form — the actual
    // regression was that the form rendered with empty values.
    await expect(page.locator('#fm-title')).toHaveValue(title)
    await expect(page.locator('#fm-description')).toHaveValue(description)
    await expect(page.locator('#fm-category')).not.toHaveValue('')

    // Type a change into the body, then save. Use the editor-body
    // testid specifically — `[data-testid="markdown-editor"] textarea`
    // would also match the frontmatter editor's `description` textarea
    // which sits inside the same markdown-editor section.
    const bodyEditor = page.locator('[data-testid="editor-body"]')
    await bodyEditor.waitFor({ state: 'visible' })
    await bodyEditor.focus()
    await bodyEditor.press('End')
    await bodyEditor.type('\n\nedited body line')

    const saveBtn = await openPreview(page)
    await saveBtn.click()

    // Poll the SW file read until the body actually contains the new line
    // — that tells us the save round-tripped through SW. `page.evaluate`
    // runs inside the page context so fetch is intercepted by the SW.
    await expect
      .poll(
        async () => {
          const r = await readFile(page, `blog/${slug}/index.en.md`)
          return r.content?.includes('edited body line')
            ? 'has-edit'
            : 'no-edit'
        },
        { timeout: 15000 }
      )
      .toBe('has-edit')

    const final = await readFile(page, `blog/${slug}/index.en.md`)
    const fileContent = final.content ?? ''

    // The actual assertion: all required blog fields must still be in the
    // frontmatter after saving. Before the fix, stringifyFrontmatter was
    // called with an empty {} and the saved file had `---\n\n---\n...`.
    expect(fileContent).toContain(`title: ${title}`)
    expect(fileContent).toContain(`description: ${description}`)
    expect(fileContent).toMatch(/category:\s+\S+/)
    // pubDate must NOT be auto-stamped at creation (see issue #10)
    expect(fileContent).not.toMatch(/^pubDate:/m)
    expect(fileContent).toContain('lang: en')
    expect(fileContent).toContain('edited body line')
  })

  // Submitting-state unit behavior (disabled button + fields + spinner
  // class) is covered in CreateContentDialog.spec.ts — an e2e here can't
  // observe the transient `submitting=true` state because mock-mode SW
  // returns in <1ms and playwright's retry loop re-checks after the
  // state has already flipped back. We still verify that clicking the
  // Create button successfully lands on the edit page.
  test('create button routes to edit page after successful submit', async ({
    page,
  }) => {
    const slug = `nav-${Date.now()}`

    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')

    await page.locator('[data-testid="create-button"]').click()
    await page.locator('input#slug').fill(slug)
    await page.locator('input#title').fill(`Nav ${slug}`)
    await page.locator('textarea#description').fill('nav regression')
    const cat = page.locator('select#category').first()
    await expect
      .poll(() => cat.locator('option').count(), { timeout: 20000 })
      .toBeGreaterThan(1)
    await cat.selectOption({ index: 1 })

    await page.locator('[data-testid="create-submit"]').click()
    await page.waitForURL(new RegExp(`/edit/${slug}$`), { timeout: 15000 })
  })
})
