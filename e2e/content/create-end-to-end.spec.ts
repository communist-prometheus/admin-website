import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

/**
 * End-to-end create flow that goes through the REAL service worker path
 * (mock mode, no page.route stubs). This catches the class of bug where
 * the SW response shape drifts from the client's CommitResultSchema —
 * the original failure that surfaced on prod as
 * "Error: { readonly content: ... } └─ ["content"] └─ is missing".
 *
 * Unlike content-creation.spec.ts, this test does not mock
 * /api/github/file — it exercises the full fetch → routeRequest →
 * handleFileCreate → writeAndStage → commitAndPush (mock) → jsonResponse
 * → decodeResponse(CommitResultSchema) pipeline.
 */
test.describe('Create content end-to-end (real SW path)', () => {
  test('blog create succeeds without schema decode error', async ({
    page,
  }) => {
    const slug = `e2e-create-${Date.now()}`

    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/content/blog')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()

    await page.fill('#slug', slug)
    await page.fill('#title', `E2E Test ${slug}`)
    await page.fill('#description', 'Created by end-to-end test')
    // #category is a <select>; pick the first real option.
    await page.locator('#category').selectOption({ index: 1 })

    // Capture the SW response so we can assert the shape directly.
    const responsePromise = page.waitForResponse(
      res =>
        res.url().includes('/api/github/file') &&
        res.request().method() === 'POST',
      { timeout: 20000 }
    )

    await page.click('button:has-text("Create")')

    const response = await responsePromise
    expect(response.status()).toBe(200)

    const body = (await response.json()) as {
      content?: { sha?: string }
      commit?: { sha?: string }
      error?: string
    }
    expect(body.error).toBeUndefined()
    expect(body.content?.sha).toBeTruthy()
    expect(body.commit?.sha).toBeTruthy()

    // Dialog closes on success and parent redirects to the edit page.
    await expect(page.locator('.create-dialog')).toBeHidden({
      timeout: 10000,
    })
    await expect(page).toHaveURL(new RegExp(`/content/blog/edit/${slug}`))

    // No error surfaced to the UI's ErrorMessage component.
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden()

    // No schema-decode errors in the console.
    const schemaErrors = errors.filter(
      e => e.includes('is missing') || e.includes('CommitResultSchema')
    )
    expect(schemaErrors).toEqual([])
  })

  test('position create succeeds without Order field', async ({ page }) => {
    const slug = `e2e-pos-${Date.now()}`

    await page.goto('/content/positions')
    await page.waitForLoadState('networkidle')
    await waitForContentReady(page)

    await page.click('button:has-text("New")')
    await expect(page.locator('.create-dialog')).toBeVisible()

    // No Order field after the pubDate migration.
    await expect(page.locator('#order')).toBeHidden()

    await page.fill('#slug', slug)
    await page.fill('#title', `E2E Position ${slug}`)
    await page.fill('#description', 'Created by end-to-end test')

    const responsePromise = page.waitForResponse(
      res =>
        res.url().includes('/api/github/file') &&
        res.request().method() === 'POST',
      { timeout: 20000 }
    )

    await page.click('button:has-text("Create")')

    const response = await responsePromise
    expect(response.status()).toBe(200)

    const body = (await response.json()) as {
      content?: { sha?: string }
      commit?: { sha?: string }
    }
    expect(body.content?.sha).toBeTruthy()
    expect(body.commit?.sha).toBeTruthy()

    await expect(page.locator('.create-dialog')).toBeHidden({
      timeout: 10000,
    })
  })

  // Error-surfacing path for non-OK SW responses is covered by the unit
  // test at src/validation/decode-response.test.ts which exercises the
  // extractor directly. Faking an error at e2e level is unreliable
  // because page.route cannot reach requests that the SW handles
  // internally without going through the network.
})
