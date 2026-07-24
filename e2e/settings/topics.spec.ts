import {
  click,
  expectCount,
  expectMinCount,
  expectText,
  expectVisible,
  test,
  visit,
} from '@prometheus/e2e-toolkit'

test.describe('Settings - Topics', () => {
  test('exposes a Topics section reachable from the settings nav', async ({
    page,
  }) => {
    await visit(page, '/settings/topics')
    await expectText(page, page.locator('h1'), 'Settings')
    await expectVisible(
      page,
      page.locator('[data-testid="settings-nav-topics"]')
    )
    await expectText(page, page.locator('h2').first(), 'Topics')
  })

  test('renders the topics editor table', async ({ page }) => {
    await visit(page, '/settings/topics')
    /*
     * Wait on the editor's Add button first: it only mounts once the
     * topics store has finished loading (the v-else branch), so it is
     * the deterministic "editor is ready" signal. The table can be
     * empty when the sandbox has no topics.json, so gating on the
     * button — not a fixed delay — avoids the first-load SW race.
     */
    await expectVisible(page, page.locator('[data-testid="add-topic"]'))
    await expectVisible(page, page.locator('[data-testid="topics-table"]'))
  })

  test('adds a topic row with a colour picker', async ({ page }) => {
    await visit(page, '/settings/topics')
    const rows = page.locator('[data-testid="topic-row"]')
    const initial = await rows.count()

    await click(page, page.locator('[data-testid="add-topic"]'))
    await expectCount(page, rows, initial + 1)
    await expectVisible(
      page,
      rows.last().locator('[data-testid="topic-color"]')
    )
  })

  test('removes a topic row', async ({ page }) => {
    await visit(page, '/settings/topics')
    const rows = page.locator('[data-testid="topic-row"]')

    /* Guarantee at least one row exists before removing one. */
    await click(page, page.locator('[data-testid="add-topic"]'))
    await expectMinCount(page, rows, 1)

    const count = await rows.count()
    await click(page, page.locator('[data-testid="remove-topic"]').last())
    await expectCount(page, rows, count - 1)
  })
})
