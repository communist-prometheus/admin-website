import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

test.describe('Pending deploy appears on home after save', () => {
  test('save article then navigate to home — pending card visible', async ({
    page,
  }) => {
    // 1. Go to blog list
    await page.goto('/content/blog')
    await waitForContentReady(page)

    // 2. Open first article
    await page.locator('h3').first().click()
    await page.waitForURL(/\/edit\//)
    await waitForContentReady(page)

    // 3. Save
    const saveBtn = page.getByTestId('save-button')
    await saveBtn.click()

    // 4. Wait for save to complete (checkmark)
    await expect(saveBtn).toContainText('Saved', { timeout: 30000 })

    // 5. Verify pending_deploy is in sessionStorage
    const hasPending = await page.evaluate(
      () => !!sessionStorage.getItem('pending_deploy')
    )
    expect(hasPending).toBe(true)

    // 6. Navigate to home page
    await page.goto('/')

    // 7. Wait for deploy list to load
    await expect(page.getByText('Recent Deployments')).toBeVisible({
      timeout: 15000,
    })

    // 8. Pending card MUST be visible
    const pending = page.locator('.pending-card')
    await expect(pending).toBeVisible({ timeout: 5000 })

    // 9. Pending card must have DEPLOYING badge
    await expect(pending.locator('.badge')).toContainText('deploying', {
      ignoreCase: true,
    })
  })
})
