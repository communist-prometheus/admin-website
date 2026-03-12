import type { Page } from '@playwright/test'

interface TrackingState {
  conditionMet: boolean
  conditionMetTime: number
  lastNetworkActivityTime: number
}

/**
 * Update condition tracking state based on checker result.
 * @param state - Current tracking state
 * @param result - Checker result
 * @param now - Current timestamp
 */
const updateCondition = (
  state: TrackingState,
  result: boolean,
  now: number
): void => {
  if (result && !state.conditionMet) {
    state.conditionMet = true
    state.conditionMetTime = now
  } else if (!result && state.conditionMet) {
    state.conditionMet = false
    state.conditionMetTime = 0
  }
}

/**
 * Check if tracking has settled (condition met + network quiet).
 * @param state - Current tracking state
 * @param now - Current timestamp
 * @param settleTime - Required settle duration
 * @returns True if settled
 */
const isSettled = (
  state: TrackingState,
  now: number,
  settleTime: number
): boolean => {
  if (!state.conditionMet) return false
  const sinceActivity = now - state.lastNetworkActivityTime
  const sinceCondition = now - state.conditionMetTime
  return sinceActivity >= settleTime || sinceCondition >= settleTime
}

/**
 * Wait with network activity tracking and a checker function.
 * Resolves when checker returns true AND network has settled.
 * @param page - Playwright Page
 * @param checker - Safe checker, returns true when ready
 * @param options - Timing configuration
 */
export const waitWithNetworkTracking = async (
  page: Page,
  checker: () => Promise<boolean>,
  options: {
    readonly networkSettleTime?: number
    readonly maxWaitTime?: number
    readonly checkInterval?: number
  } = {}
): Promise<void> => {
  const {
    networkSettleTime = 500,
    maxWaitTime = 30000,
    checkInterval = 100,
  } = options
  const state: TrackingState = {
    conditionMet: false,
    conditionMetTime: 0,
    lastNetworkActivityTime: Date.now(),
  }
  const startTime = Date.now()
  const listener = () => {
    state.lastNetworkActivityTime = Date.now()
  }
  page.on('request', listener)
  try {
    while (true) {
      const now = Date.now()
      if (now - startTime > maxWaitTime) {
        throw new Error(
          `waitWithNetworkTracking: max ${maxWaitTime}ms exceeded`
        )
      }
      updateCondition(state, await checker(), now)
      if (isSettled(state, now, networkSettleTime)) break
      await page.waitForTimeout(checkInterval)
    }
  } finally {
    page.off('request', listener)
  }
}

/**
 * Wait for content page to be fully loaded.
 * Checks that loading overlay is hidden (content loaded via SW).
 * @param page - Playwright page instance
 */
export const waitForContentReady = async (page: Page): Promise<void> => {
  await waitWithNetworkTracking(page, () =>
    page
      .locator('.loading-overlay')
      .isHidden()
      .catch(() => true)
  )
}
