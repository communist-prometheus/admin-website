import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

/**
 * End-to-end create flow. The create dialog collects metadata and
 * navigates to the edit page WITHOUT making any API call. The file
 * is created on Save. These tests verify the dialog → edit transition.
 */
test.describe('Create content end-to-end (draft flow)', () => {
  test('blog create navigates to edit page with pre-filled data', async ({
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

    await page.click('button:has-text("Create")')

    // Dialog closes and navigates to edit page — no API call.
    await expect(page.locator('.create-dialog')).toBeHidden({
      timeout: 10000,
    })
    await expect(page).toHaveURL(new RegExp(`/content/blog/edit/${slug}`))

    // Editor is pre-filled from draft.
    await expect(page.locator('input[type="text"]').first()).toHaveValue(
      `E2E Test ${slug}`
    )

    // No errors in console.
    const schemaErrors = errors.filter(
      e => e.includes('is missing') || e.includes('Schema')
    )
    expect(schemaErrors).toEqual([])
  })

  test('position create navigates without Order field', async ({ page }) => {
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

    await page.click('button:has-text("Create")')

    await expect(page.locator('.create-dialog')).toBeHidden({
      timeout: 10000,
    })
    await expect(page).toHaveURL(
      new RegExp(`/content/positions/edit/${slug}`)
    )
  })
})
