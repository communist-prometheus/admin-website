import type { Page } from '@playwright/test'
import { expectVisible, visit } from '@prometheus/e2e-toolkit'

/*
 * Admin specs that interact with settings/tracing immediately after
 * navigation were flaking on CI: SW activate fires controllerchange
 * after the toolkit's visit() returned but before the test body ran,
 * tearing the DOM and stale-ing every locator already in flight.
 *
 * The settled-visit helper wraps visit() with a networkidle wait so
 * we're certain the SW has finished its activate/install handshake
 * before the test body starts. Pair it with a stable-element wait
 * (a data-testid the page renders only after the SW is controlling
 * the document) for the strongest guarantee.
 *
 * Memory: feedback_e2e_sw_settle.md
 */

/**
 * Navigate to `url`, wait for both the request graph and the SW
 * lifecycle to settle, then assert `stableTestId` is visible. The
 * stable test-id is required — it is the post-activate DOM anchor
 * that proves the controllerchange handshake has completed before
 * the test body starts. Without it we can't tell a fresh-DOM render
 * from a half-torn DOM, and that's exactly the flake source.
 *
 * @param page Playwright page.
 * @param url Absolute or relative URL.
 * @param stableTestId data-testid that proves the post-activate DOM
 *   is what the test will interact with.
 */
export const visitSettled = async (
  page: Page,
  url: string,
  stableTestId: string
): Promise<void> => {
  await visit(page, url)
  await page.waitForLoadState('networkidle')
  await expectVisible(page, page.locator(`[data-testid="${stableTestId}"]`))
}
