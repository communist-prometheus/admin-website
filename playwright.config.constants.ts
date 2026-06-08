/** Glob pattern to exclude lighthouse tests. */
export const LIGHTHOUSE_TEST_PATTERN = '**/lighthouse/**'

/** Glob pattern to exclude mobile-specific tests. */
export const MOBILE_TEST_PATTERN = '**/mobile/**'

/**
 * Glob pattern for the throttled critical-path suite. Tests under
 * `e2e/throttled/` opt every page into Slow 3G + 4× CPU emulation via
 * a `beforeEach` hook (see `e2e/throttled/throttle.ts`). The desktop
 * + mobile projects exclude this pattern so the throttling never
 * leaks into a fast-mode run.
 */
export const THROTTLED_TEST_PATTERN = '**/throttled/**'

/**
 * The comms walkthrough recording is a long-running scripted scene
 * (5 min budget, 350 ms slowMo) intended for `playwright.config.walkthrough.ts`,
 * not the regular CI suite. Excluding it from the default config keeps
 * it out of the 30 s default timeout sweep.
 */
export const WALKTHROUGH_TEST_PATTERN = '**/comms-walkthrough/**'
