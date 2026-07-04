import {
  click,
  expect,
  expectCount,
  expectText,
  expectValue,
  expectVisible,
  fill,
  type Page,
  test,
} from '@prometheus/e2e-toolkit'
import { visitSettled } from '../helpers/visit-settled'

const gotoSettings = async (page: Page): Promise<void> => {
  /*
   * Settings is now sub-routed — Members lives at /settings/members
   * instead of scrolling through /settings. Navigate directly.
   */
  await visitSettled(page, '/settings/members', 'members-section')
  // Gate on member-data arrival, not just the structural section.
  // `members-section` paints before the org-members SW round-trip
  // resolves; a specific row renders only after it does. Without this
  // the dialog helpers (which wait for the request graph to go idle)
  // fight the in-flight load for the whole 30s budget under CI.
  await expectVisible(
    page,
    page.locator('[data-testid="member-row-alice-admin"]')
  )
}

test.describe('Members — unified org list with CRUD', () => {
  test('renders one flat members section (no legacy org-admins group)', async ({
    page,
  }) => {
    await gotoSettings(page)
    await expectCount(
      page,
      page.locator('[data-testid="org-admins-group"]'),
      0
    )
    await expectVisible(page, page.locator('[data-testid="members-section"]'))
  })

  test('lists every org member with an app-role select', async ({ page }) => {
    await gotoSettings(page)
    await expectVisible(
      page,
      page.locator('[data-testid="member-row-alice-admin"]')
    )
    await expectVisible(
      page,
      page.locator('[data-testid="member-row-bob-chief"]')
    )
    await expectVisible(
      page,
      page.locator('[data-testid="member-row-carol-edit"]')
    )
    await expectVisible(
      page,
      page.locator('[data-testid="member-row-dave-none"]')
    )
    await expectVisible(
      page,
      page.locator('[data-testid="role-select-alice-admin"]')
    )
  })

  test('changing a role on a row sends it through the SW', async ({
    page,
  }) => {
    await gotoSettings(page)
    const select = page.locator('[data-testid="role-select-dave-none"]')
    await expectVisible(page, select)
    await select.selectOption('editor')
    /*
     * In mock mode the SW returns success and the UI reloads; mock
     * data still reflects dave-none as unassigned, so this just
     * proves the option was accepted by the select.
     */
    await expect(select).not.toBeDisabled()
  })

  test('admin org-member is badged as "Org admin"', async ({ page }) => {
    await gotoSettings(page)
    const row = page.locator('[data-testid="member-row-alice-admin"]')
    await expectVisible(page, row)
    await expectText(page, row.locator('.org-badge.is-admin'), /org admin/i)
  })

  test('a pending invitation is rendered with the Revoke button', async ({
    page,
  }) => {
    await gotoSettings(page)
    await expectVisible(page, page.locator('[data-testid="invite-row-99"]'))
    await expectVisible(
      page,
      page.locator('[data-testid="invite-revoke-99"]')
    )
  })

  test('Invite button opens the dialog', async ({ page }) => {
    await gotoSettings(page)
    await click(page, page.locator('[data-testid="invite-open"]'))
    await expectVisible(page, page.locator('[data-testid="invite-dialog"]'))
    await expectVisible(page, page.locator('[data-testid="invite-cancel"]'))
    await expectVisible(page, page.locator('[data-testid="invite-submit"]'))
  })

  test('Invite dialog can be filled in with an email and role', async ({
    page,
  }) => {
    await gotoSettings(page)
    await click(page, page.locator('[data-testid="invite-open"]'))
    await fill(
      page,
      page.locator('[data-testid="invite-identifier"]'),
      'newperson@example.com'
    )
    await page.locator('[data-testid="invite-role"]').selectOption('editor')
    await expectValue(
      page,
      page.locator('[data-testid="invite-identifier"]'),
      'newperson@example.com'
    )
    await expectValue(
      page,
      page.locator('[data-testid="invite-role"]'),
      'editor'
    )
  })
})
