import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

/**
 * End-to-end create flow that goes through the REAL service worker path
 * (mock mode, no page.route stubs). This catches the class of bug where
 * the SW response shape drifts from the client's StagedResultSchema.
 *
 * The new flow is: POST /api/github/file (stage only) → client calls
 * POST /api/github/commit (commit+push) via pushAndTrack.
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
    await page.locator('#category').selectOption({ index: 1 })

    // Capture the stage response.
    const stagePromise = page.waitForResponse(
      res =>
        res.url().includes('/api/github/file') &&
        res.request().method() === 'POST',
      { timeout: 20000 }
    )

    await page.click('button:has-text("Create")')

    const stageResponse = await stagePromise
    expect(stageResponse.status()).toBe(200)

    const stageBody = (await stageResponse.json()) as {
      content?: { sha?: string }
      staged?: boolean
      error?: string
    }
    expect(stageBody.error).toBeUndefined()
    expect(stageBody.content?.sha).toBeTruthy()
    expect(stageBody.staged).toBe(true)

    // Dialog closes on success and parent redirects to the edit page.
    await expect(page.locator('.create-dialog')).toBeHidden({
      timeout: 15000,
    })
    await expect(page).toHaveURL(new RegExp(`/content/blog/edit/${slug}`))

    // No error surfaced to the UI's ErrorMessage component.
    await expect(page.locator('[data-testid="error-message"]')).toBeHidden()

    // No schema-decode errors in the console.
    const schemaErrors = errors.filter(
      e => e.includes('is missing') || e.includes('StagedResultSchema')
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

    await expect(page.locator('#order')).toBeHidden()

    await page.fill('#slug', slug)
    await page.fill('#title', `E2E Position ${slug}`)
    await page.fill('#description', 'Created by end-to-end test')

    const stagePromise = page.waitForResponse(
      res =>
        res.url().includes('/api/github/file') &&
        res.request().method() === 'POST',
      { timeout: 20000 }
    )

    await page.click('button:has-text("Create")')

    const stageResponse = await stagePromise
    expect(stageResponse.status()).toBe(200)

    const stageBody = (await stageResponse.json()) as {
      content?: { sha?: string }
      staged?: boolean
    }
    expect(stageBody.content?.sha).toBeTruthy()
    expect(stageBody.staged).toBe(true)

    await expect(page.locator('.create-dialog')).toBeHidden({
      timeout: 15000,
    })
  })
})
