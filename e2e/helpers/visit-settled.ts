import type { Page } from '@playwright/test'
import { expectVisible, visit } from '@prometheus/e2e-toolkit'

/*
 * Admin specs that interact with settings/tracing immediately after
 * navigation were flaking on CI: SW activate fires controllerchange
 * after the toolkit's visit() returned but before the test body ran,
 * tearing the DOM and stale-ing every locator already in flight.
 *
 * The fix is event-shaped, not time-shaped: wait for the SW to be
 * CONTROLLING the document (controllerchange already delivered),
 * then anchor on a stable test-id the page renders only after that
 * handshake. The previous version used waitForLoadState
 * ('networkidle') here — a hidden >=500 ms sleep per visit that the
 * toolkit philosophy exists to eliminate.
 *
 * Memory: feedback_e2e_sw_settle.md
 */

/**
 * Wait until the SW lifecycle has settled for the current document.
 * Use after any action that (re)registers the SW — e.g. the first
 * authenticated load — and BEFORE the next navigation: activation
 * claims clients and aborts an in-flight goto (net::ERR_ABORTED).
 * WebKit in Playwright never exposes `controller`, so an active
 * registration counts as the same lifecycle gate there.
 * @param page Playwright page.
 */
export const waitForSWControl = async (page: Page): Promise<void> => {
  await page.waitForFunction(async () => {
    const sw = navigator.serviceWorker
    const reg = sw ? await sw.getRegistration() : undefined
    return !sw || sw.controller !== null || Boolean(reg?.active)
  })
}

/**
 * Navigate to `url`, wait for the SW to control the page, then
 * assert `stableTestId` is visible. The stable test-id is required —
 * it is the post-activate DOM anchor that proves the
 * controllerchange handshake has completed before the test body
 * starts. Without it we can't tell a fresh-DOM render from a
 * half-torn DOM, and that's exactly the flake source.
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
  await waitForSWControl(page)
  // First-visit budget: a cold SW boot (register + activate + mock
  // clone) under 4-worker CPU contention legitimately exceeds the
  // toolkit's 10 s default ceiling on CI. Still event-driven — the
  // wait resolves the instant the anchor renders.
  await expectVisible(page, page.locator(`[data-testid="${stableTestId}"]`), {
    maxMs: 30_000,
  })
}
