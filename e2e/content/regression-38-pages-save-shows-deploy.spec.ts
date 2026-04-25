import { expect, test } from '@playwright/test'
import { ContentEditPage } from '../pages/ContentEditPage'

/**
 * Regression for issue #38.
 *
 * After a successful save through the full publish-confirm flow on
 * pages/manifest:
 *   - the deploy status bar must show progress (`.deploy-bar.building`)
 *   - the home page must list the new pending deploy entry
 *
 * Production behaviour: the save spinner clears, no deploy bar, no
 * pending entry on /home. The user has no signal that the change was
 * committed and queued for deploy.
 */
test.describe('Issue #38 — saving a page surfaces the deploy in the UI', () => {
  test('deploy-bar appears and home shows the pending entry', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('pages', 'manifest')

    const editor = ep.getEditorBody()
    await editor.fill(
      `${await editor.inputValue()}\n\n<!-- regression-38 deploy bar -->`
    )

    await page.locator('[data-testid="preview-button"]').click()
    await page.locator('[data-testid="save-button"]').click()
    // pages are autoPublic — confirm dialog opens.
    await page
      .locator('[data-testid="publish-confirm-btn"]')
      .click({ timeout: 5000 })

    // Save success — preview auto-exits and Preview button reappears.
    await expect(page.locator('[data-testid="preview-button"]')).toBeVisible({
      timeout: 30000,
    })

    // Deploy status bar is mounted globally and must reflect the
    // running deploy after a save lands.
    await expect(page.locator('.deploy-bar')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.locator('.deploy-bar')).toHaveClass(/\bbuilding\b/, {
      timeout: 15000,
    })

    // Pending deploy is persisted in sessionStorage so the home page
    // can render the optimistic entry.
    const pending = await page.evaluate(() =>
      globalThis.sessionStorage.getItem('pending_deploy')
    )
    expect(pending).not.toBeNull()

    // Home dashboard must list the new pending entry, even while
    // GitHub Actions polling is still in flight (the issue user saw
    // on prod was "Loading deployments..." masking the entry).
    await page.goto('/')
    await expect(page.locator('section.deploy-list h2')).toContainText(
      /recent deployments/i,
      { timeout: 10000 }
    )
    await expect(
      page.locator('section.deploy-list .deploy-item').first()
    ).toBeVisible({ timeout: 10000 })
    await expect(
      page.locator('section.deploy-list .status', {
        hasText: /loading deployments/i,
      })
    ).toHaveCount(0)
  })
})
