import type { Page } from '@playwright/test'

interface NetworkActivityTracker {
  activeRequests: Set<string>
  lastActivityTime: number
}

const trackers = new WeakMap<Page, NetworkActivityTracker>()

/**
 * Initialize network activity tracking for a page
 * @param {Page} page - Playwright page instance
 * @returns {NetworkActivityTracker} Network activity tracker
 */
const initNetworkTracking = (page: Page): NetworkActivityTracker => {
  let tracker = trackers.get(page)

  if (!tracker) {
    const newTracker: NetworkActivityTracker = {
      activeRequests: new Set(),
      lastActivityTime: Date.now(),
    }
    tracker = newTracker
    trackers.set(page, newTracker)

    page.on('request', request => {
      newTracker.activeRequests.add(request.url())
      newTracker.lastActivityTime = Date.now()
    })

    page.on('response', response => {
      newTracker.activeRequests.delete(response.url())
      newTracker.lastActivityTime = Date.now()
    })

    page.on('requestfailed', request => {
      newTracker.activeRequests.delete(request.url())
      newTracker.lastActivityTime = Date.now()
    })
  }

  return tracker
}

/**
 * Wait for network to become idle with smart timeout logic:
 * - Initial timeout: 15 seconds if no network activity
 * - Maximum timeout: 45 seconds total
 * - Timer resets when network activity detected
 * @param {Page} page - Playwright page instance
 * @param {object} options - Configuration options
 * @param {number} [options.initialTimeout=15000] - Initial timeout in ms
 * @param {number} [options.maxTimeout=45000] - Maximum timeout in ms
 * @param {number} [options.idleTime=500] - Idle time in ms
 */
export const waitForNetworkIdle = async (
  page: Page,
  options: {
    readonly initialTimeout?: number
    readonly maxTimeout?: number
    readonly idleTime?: number
  } = {}
): Promise<void> => {
  const {
    initialTimeout = 15000,
    maxTimeout = 45000,
    idleTime = 500,
  } = options

  const tracker = initNetworkTracking(page)
  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    const check = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const timeSinceActivity = now - tracker.lastActivityTime

      // Fail if max timeout exceeded
      if (elapsed > maxTimeout) {
        reject(
          new Error(
            `Network activity timeout: exceeded maximum ${maxTimeout}ms. Active requests: ${tracker.activeRequests.size}`
          )
        )
        return
      }

      // Fail if no activity and initial timeout exceeded
      if (
        timeSinceActivity > initialTimeout &&
        tracker.activeRequests.size > 0
      ) {
        reject(
          new Error(
            `Network activity timeout: no progress for ${initialTimeout}ms. Active requests: ${tracker.activeRequests.size}`
          )
        )
        return
      }

      // Success if idle
      if (
        tracker.activeRequests.size === 0 &&
        timeSinceActivity >= idleTime
      ) {
        resolve()
        return
      }

      // Continue checking
      setTimeout(check, 100)
    }

    check()
  })
}

/**
 * Wait for specific API endpoint to be called and completed
 * @param {Page} page - Playwright page instance
 * @param {string | RegExp} urlPattern - URL pattern to match
 * @param {object} options - Configuration options
 * @param {number} [options.timeout=15000] - Timeout in ms
 * @param {string} [options.method] - HTTP method to match
 */
export const waitForApiCall = async (
  page: Page,
  urlPattern: string | RegExp,
  options: {
    readonly timeout?: number
    readonly method?: string
  } = {}
): Promise<void> => {
  const { timeout = 15000, method } = options

  await page.waitForResponse(
    response => {
      const matchesUrl =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url())

      const matchesMethod = method
        ? response.request().method() === method
        : true

      return matchesUrl && matchesMethod
    },
    { timeout }
  )
}

/**
 * Wait for content to load (generic content API call)
 * @param {Page} page - Playwright page instance
 * @param {string} contentType - Content type to wait for
 */
export const waitForContentLoad = async (
  page: Page,
  contentType: string
): Promise<void> => {
  await waitForApiCall(page, `/api/github/content/${contentType}`, {
    method: 'GET',
    timeout: 15000,
  })
}
