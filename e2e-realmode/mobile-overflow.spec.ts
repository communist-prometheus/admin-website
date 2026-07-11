import { devices } from '@playwright/test'
import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'

const TARGET = '/content/magazine/edit/issue-1'

test.use(devices['iPhone 12 Pro'])

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

/* User report (2026-05-10): magazine edit page on mobile renders
 * ~840 px wide (more than 2× the 390 px viewport). Root cause was a
 * missing `min-width: 0` on `.frontmatter-editor` paired with a
 * `.slug` flex item that refused to shrink in `LinkedArticleRow`.
 * Long Russian article slugs in the issue's `articles` list pushed
 * the row past the viewport and the whole frontmatter section
 * inherited the bloat.
 *
 * This test pins the layout: at iPhone 12 Pro width the document
 * must not scroll horizontally. The baseline `issue-1` deliberately
 * lists `programme-outline-introduction` (a 30-char slug) so the
 * overflow surface is real, not synthetic. */
test('mobile: magazine edit fits the viewport horizontally', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'mobile-magazine')
  await visit(page, TARGET, SLOW)
  await expectVisible(page, page.locator('input#fm-title'), SLOW)
  /* The articles picker must have rendered before we measure —
   * its rows are the widest content on this page. */
  await expectVisible(
    page,
    page.locator('[data-testid^="linked-"]').first(),
    SLOW
  )

  const widths = await page.evaluate(() => ({
    inner: window.innerWidth,
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }))

  expect(
    widths.doc,
    `document scroll width (${widths.doc}) must not exceed viewport (${widths.inner}) on mobile`
  ).toBeLessThanOrEqual(widths.inner + 1)
  expect(widths.body).toBeLessThanOrEqual(widths.inner + 1)
})
