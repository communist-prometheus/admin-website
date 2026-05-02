import {
  click,
  expectHidden,
  expectVisible,
  pressKey,
  test,
} from '@prometheus/e2e-toolkit'
import { visitSettled } from '../helpers/visit-settled'

test.describe('trace overlay (5.4)', () => {
  test.beforeEach(async ({ page }) => {
    await visitSettled(page, '/', 'notification-indicator')
  })

  test('Ctrl+Shift+T toggles the overlay', async ({ page }) => {
    const overlay = page.locator('[data-testid="trace-overlay"]')
    await expectHidden(page, overlay)
    await pressKey(page, 'Control+Shift+T')
    await expectVisible(page, overlay)
    await pressKey(page, 'Control+Shift+T')
    await expectHidden(page, overlay)
  })

  test('close button hides the overlay', async ({ page }) => {
    await pressKey(page, 'Control+Shift+T')
    const overlay = page.locator('[data-testid="trace-overlay"]')
    await expectVisible(page, overlay)
    await click(page, page.locator('[data-testid="trace-overlay-close"]'))
    await expectHidden(page, overlay)
  })

  test('shows empty state when no spans recorded', async ({ page }) => {
    await pressKey(page, 'Control+Shift+T')
    await expectVisible(
      page,
      page.locator('[data-testid="trace-overlay-empty"]')
    )
  })
})
