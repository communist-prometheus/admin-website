import process from 'node:process'
import { type Page, visit, type WaitOptions } from '@prometheus/e2e-toolkit'

const PAT = process.env['GITHUB_E2E_KEY'] ?? ''

/**
 * Seed the GitHub PAT into localStorage and reload, so the auth store
 * boots with an authenticated user without the OAuth round-trip.
 *
 * Relies on the toolkit's request-graph-aware {@link visit} for both
 * loads — never falls back to `networkidle` or blind sleeps.
 * @param page - Playwright page to seed
 * @param options - Wait tunables forwarded to `visit`
 */
export const seedTokenAndLoad = async (
  page: Page,
  options?: WaitOptions
): Promise<void> => {
  if (!PAT) throw new Error('GITHUB_E2E_KEY missing')
  await visit(page, '/', options)
  await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)
  await page.reload({ waitUntil: 'domcontentloaded' })
}
