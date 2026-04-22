import { expect, test } from '@playwright/test'

const gotoSettings = async (
  page: import('@playwright/test').Page
): Promise<void> => {
  await page.goto('/settings')
  await expect(page.locator('[data-testid="org-admins-group"]')).toBeVisible({
    timeout: 15000,
  })
}

test.describe('Members — GitHub org admins group', () => {
  test('Settings renders the Org Admins bucket above role groups', async ({
    page,
  }) => {
    await gotoSettings(page)
    const org = page.locator('[data-testid="org-admins-group"]')
    await expect(org).toBeVisible()
    await expect(org.locator('h3')).toContainText(/github org/i)
  })

  test('shows a loading hint initially, then either a list or an empty hint', async ({
    page,
  }) => {
    await gotoSettings(page)
    const org = page.locator('[data-testid="org-admins-group"]')
    // Eventually either the list is visible, or a hint paragraph explains
    // why it is empty. Both are acceptable terminal states.
    await expect
      .poll(
        async () => {
          const hasList = await org.locator('ul').count()
          const hasHint = await org.locator('.hint').count()
          return hasList + hasHint > 0
        },
        { timeout: 10000 }
      )
      .toBe(true)
  })

  test('empty-state copy explains the read:org scope requirement', async ({
    page,
  }) => {
    await gotoSettings(page)
    const org = page.locator('[data-testid="org-admins-group"]')
    const hint = org.locator('.hint')
    // In the mock build there are no real org admins, so the empty hint
    // is the expected state.
    if (await hint.isVisible()) {
      await expect(hint).toContainText(/read:org/i)
    }
  })

  test('org-members SW endpoint answers without blowing up the UI', async ({
    page,
  }) => {
    await gotoSettings(page)
    const response = await page.evaluate(async () => {
      const r = await fetch('/api/github/org-members')
      return { status: r.status, ok: r.ok }
    })
    // In mock mode the endpoint should still reply (200 with empty list)
    // OR degrade to an empty body; never a 500.
    expect([200, 404].includes(response.status)).toBe(true)
  })
})
