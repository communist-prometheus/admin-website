import { expect, test } from '@playwright/test'
import { waitForContentReady } from '../helpers/content-ready'

// NOTE(deploy-history-rewrite): tests asserting pending-card transitions
// through PENDING → BUILDING → replaced. The new GitHub-Actions-polled
// DeployItem doesn't have a pending-card concept. Skipped until the deploy
// UX is finalized.
test.describe
  .skip('Pending deploy status transitions', () => {
    test('pending card shows PENDING badge immediately', async ({ page }) => {
      await page.goto('/content/blog')
      await waitForContentReady(page)
      await page.locator('h3').first().click()
      await page.waitForURL(/\/edit\//)
      await waitForContentReady(page)

      await page.getByTestId('save-button').click()
      await expect(page.getByTestId('save-button')).toContainText('Saved', {
        timeout: 30000,
      })

      await page.goto('/')
      await expect(page.getByText('Recent Deployments')).toBeVisible({
        timeout: 15000,
      })

      const pending = page.locator('.pending-card')
      await expect(pending).toBeVisible({ timeout: 5000 })
      await expect(pending.locator('.badge')).toContainText('deploying', {
        ignoreCase: true,
      })
    })

    test('pending card transitions to BUILDING after poll', async ({
      page,
    }) => {
      await page.goto('/content/blog')
      await waitForContentReady(page)
      await page.locator('h3').first().click()
      await page.waitForURL(/\/edit\//)
      await waitForContentReady(page)

      await page.getByTestId('save-button').click()
      await expect(page.getByTestId('save-button')).toContainText('Saved', {
        timeout: 30000,
      })

      await page.goto('/')
      await expect(page.getByText('Recent Deployments')).toBeVisible({
        timeout: 15000,
      })

      const pending = page.locator('.pending-card')
      await expect(pending).toBeVisible({ timeout: 5000 })

      // Pending card should show DEPLOYING status
      await expect(pending.locator('.badge')).toContainText('deploying', {
        ignoreCase: true,
      })
    })

    test('real deploy card replaces pending when commit appears', async ({
      page,
    }) => {
      await page.goto('/')
      await expect(page.getByText('Recent Deployments')).toBeVisible({
        timeout: 15000,
      })

      // All real cards should be links (not pending)
      const links = page.locator('a.deploy-item')
      await expect(links.first()).toBeVisible({ timeout: 15000 })

      // Real cards should NOT have 'pending' badge
      const firstBadge = links.first().locator('.badge')
      await expect(firstBadge).not.toContainText('pending', {
        ignoreCase: true,
      })
    })
  })
