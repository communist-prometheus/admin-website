import {
  expectVisible,
  type Page,
  visit,
  type WaitOptions,
} from '@prometheus/e2e-toolkit'
import { TESTID } from '../../src/redesign/testids'
import { wirePageLog } from './page-log'
import { seedTokenAndLoad } from './seed-token'

/**
 * Real-mode entry for the REBUILT admin.
 *
 * Every other spec in this suite drives the previous Vue client, which the
 * production build stopped serving when `redesign-as-index.ts` began
 * promoting the rebuilt app to `/`. The gate therefore protected code no
 * editor could reach, which is how creating a material shipped as a stub
 * and stayed green. These helpers point the same real sandbox round-trip at the
 * app that is actually served.
 *
 * The rebuilt admin lives at `/redesign.html` in this build; `/` keeps the
 * old client while its specs still exist.
 */

/**
 * A real GitHub round-trip dominates these flows; the toolkit still returns
 * as soon as the request graph goes idle, so this is a ceiling, not a sleep.
 */
export const SLOW: WaitOptions = { settleMs: 500, maxMs: 120_000 }

/** GitHub login that owns the sandbox PAT — the post-auth UI signal. */
const AUTH_USER_NAME = 'undeadliner'

const APP = '/redesign.html'

/** The app's own hash route, as the shell reads it. */
export const route = (hash: string): string => `${APP}#/${hash}`

const anchor = (page: Page, id: string) =>
  page.locator(`[data-testid="${id}"]`)

/** A locator for one of the app's stable anchors. */
export const at = (page: Page, id: string) => anchor(page, id)

/**
 * Boot the rebuilt admin into an authenticated state: token seeded, the
 * shell resolved to a real account. The account chip is the signal — it
 * renders only once the session check has resolved a user, so waiting on it
 * proves auth settled rather than that some markup appeared.
 * @param page - Playwright page.
 * @param tag - Short tag for log lines (typically the spec name).
 */
export const bootRedesign = async (
  page: Page,
  tag: string
): Promise<void> => {
  wirePageLog(page, tag)
  await seedTokenAndLoad(page, SLOW, APP)
  await expectVisible(page, anchor(page, TESTID.account), SLOW)
  await expectVisible(
    page,
    anchor(page, TESTID.account).getByText(AUTH_USER_NAME),
    SLOW
  )
}

/**
 * Navigate to one of the app's routes and wait until the shell reports it.
 * The shell stamps `data-route` on the screen container, so the wait is an
 * identity predicate — "the editor is showing" rather than "something is".
 * @param page - Playwright page.
 * @param hash - Route without the leading `#/` (e.g. `articles`).
 * @param screen - The `data-route` value the shell settles on.
 */
export const goRoute = async (
  page: Page,
  hash: string,
  screen: string
): Promise<void> => {
  await visit(page, route(hash), SLOW)
  await expectVisible(
    page,
    page.locator(`[data-testid="${TESTID.screen}"][data-route="${screen}"]`),
    SLOW
  )
}

/**
 * Wait until the editor is bound to a specific file. `data-path` is written
 * only after the document is applied, so this terminates on the document the
 * test means rather than on any editor being on screen.
 * @param page - Playwright page.
 * @param path - Repository path the editor must be showing.
 */
export const expectEditorOn = async (
  page: Page,
  path: string
): Promise<void> => {
  await expectVisible(
    page,
    page.locator(`[data-testid="${TESTID.editorDoc}"][data-path="${path}"]`),
    SLOW
  )
}
