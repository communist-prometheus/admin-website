import {
  expectVisible,
  type Page,
  type WaitOptions,
} from '@prometheus/e2e-toolkit'
import { wirePageLog } from './page-log'
import { seedTokenAndLoad } from './seed-token'

/**
 * Real GH clone + push round-trip dominates these tests; the toolkit
 * still returns the moment the request graph goes idle, so this is a
 * ceiling, not a sleep. `settleMs: 500` because isomorphic-git fires
 * fetches in bursts with sub-200ms gaps; a tighter window would
 * mistake a gap for "done".
 */
export const SLOW: WaitOptions = { settleMs: 500, maxMs: 120_000 }

/**
 * GitHub login that owns the sandbox PAT. Used as the post-auth UI
 * signal — the username chip in the header proves the auth store
 * resolved a real user before any /content/* navigation.
 */
const AUTH_USER_NAME = 'undeadliner'

/**
 * Boot the production preview into an authenticated state suitable
 * for real-mode flows: token seeded, SW registering, auth store
 * resolved. Intended to be the first call inside `beforeEach`.
 *
 * Also wires console + pageerror + requestfailed listeners so a
 * later hang produces actionable output instead of a blank trace.
 * @param page - Playwright page
 * @param tag - Short tag for log lines (typically the spec name)
 */
export const bootRealmode = async (
  page: Page,
  tag: string
): Promise<void> => {
  wirePageLog(page, tag)
  await seedTokenAndLoad(page, SLOW)
  await expectVisible(
    page,
    page.getByRole('button', { name: AUTH_USER_NAME }),
    SLOW
  )
}
