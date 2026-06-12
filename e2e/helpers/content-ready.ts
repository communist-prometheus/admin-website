import type { Page } from '@playwright/test'
import { waitForCondition } from '@prometheus/e2e-toolkit'

/*
 * Pre-toolkit this file carried its own network tracker with a
 * 500 ms settle window and a waitForTimeout poll loop — a 10x tax
 * over the toolkit's waitForCondition (50 ms settle, event-shaped
 * request-graph watch) paid on every navigation of every spec.
 */

/**
 * Wait for content page to be fully loaded: the loading overlay is
 * hidden (content arrived via the SW) and the request graph is
 * quiet. Toolkit-backed — no fixed sleeps.
 * @param page - Playwright page instance
 */
export const waitForContentReady = async (page: Page): Promise<void> => {
  await waitForCondition(page, () =>
    page
      .locator('.loading-overlay')
      .isHidden()
      .catch(() => true)
  )
}
