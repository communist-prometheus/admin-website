import { expect, test, waitForCondition } from '@prometheus/e2e-toolkit'

/*
 * Guard the mobile drawer geometry. A prior refactor (PR #350) shipped
 * a `:global(details[open]) .chevron` rule that Vue's compiler
 * silently reduced to `details[open] { transform: rotate(90deg) }`,
 * rotating every open <details> on the page. On a real mobile viewport
 * the Distribution links then measured `w=40 h=270` — character-
 * wrapped one glyph per line — which the user described as "text
 * rendered vertically". This test guards against that whole
 * category of regression by asserting every visible nav link stays
 * wider than one glyph AND that no ancestor has a transform on it.
 */

const openDrawer = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: /navigation menu/i }).click()
  await waitForCondition(
    page,
    async () =>
      (await page
        .locator('.mobile-popup')
        .evaluate(el => getComputedStyle(el).opacity)) === '1'
  )
}

test.describe('Mobile drawer layout (2.mobile-menu)', () => {
  test.use({ viewport: { width: 375, height: 812 } })
  test.skip(
    ({ isMobile }) => !isMobile,
    'The FAB + drawer are display:none above 768 px; only mobile-chromium runs here.'
  )

  test('nav-link labels never wrap to a single-character column', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)

    /* Expand every group so all labels are measured. */
    await page.$$eval('details.mobile-nav-details', els => {
      for (const d of els) d.setAttribute('open', '')
    })

    const dims = await page.locator('a.mobile-nav-link').evaluateAll(links =>
      links.map(l => {
        const r = l.getBoundingClientRect()
        return {
          text: l.textContent?.trim() ?? '',
          w: Math.round(r.width),
          h: Math.round(r.height),
        }
      })
    )

    expect(dims.length).toBeGreaterThan(0)
    for (const d of dims) {
      /*
       * A single glyph at the drawer's font size is ~15 px wide; any
       * link under ~90 px on a 375 px viewport means the label has
       * been character-wrapped. Height above 3 lines (~72 px) is the
       * upper bound — a legible one-line label is 40-45 px tall.
       */
      expect(d.w, `"${d.text}" width ${d.w}px < 90px`).toBeGreaterThan(90)
      expect(d.h, `"${d.text}" height ${d.h}px > 72px`).toBeLessThan(72)
    }
  })

  test('no ancestor of a drawer item has a transform', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.$$eval('details.mobile-nav-details', els => {
      for (const d of els) d.setAttribute('open', '')
    })

    /*
     * Explicit guard for the exact regression that shipped in PR #350
     * — a global `details[open] { transform: rotate(90deg) }` sneaked
     * in. Walk EVERY nav link's ancestor chain up to <body> and
     * assert nobody carries a transform (except the mobile-popup, which
     * uses `translateY` for its opening animation). Iterating over
     * every link — not just the first — catches a per-group
     * scoped-CSS leak that would otherwise slip through.
     */
    const withTransforms = await page.evaluate(() => {
      const results: { tag: string; cls: string; transform: string }[] = []
      for (const link of document.querySelectorAll('a.mobile-nav-link')) {
        let cur: Element | null = link
        while (cur && cur.tagName !== 'BODY') {
          const t = getComputedStyle(cur).transform
          if (t !== 'none' && !cur.className?.includes?.('mobile-popup')) {
            results.push({
              tag: cur.tagName,
              cls: String(cur.className ?? ''),
              transform: t,
            })
          }
          cur = cur.parentElement
        }
      }
      return results
    })
    expect(
      withTransforms,
      `Unexpected transforms on ancestors: ${JSON.stringify(withTransforms)}`
    ).toEqual([])
  })

  test('drawer inline-size is bounded by the viewport', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)

    const overlayRect = await page.locator('.mobile-popup').evaluate(el => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })

    /*
     * `inline-size: min(18rem, calc(100vw - 32px))` = **exactly 288 px**
     * on a 375 vw viewport (18 rem @ 16 px base). Pin the expected size
     * tightly — a slack upper bound of 343 would silently accept a
     * regression that widened the clamp to 20rem, and the point of
     * this test is to detect a return of the shrink-to-content collapse
     * (~116 px) or an accidental clamp change.
     */
    expect(
      overlayRect.w,
      `drawer width ${overlayRect.w}px too narrow`
    ).toBeGreaterThan(260)
    expect(
      overlayRect.w,
      `drawer width ${overlayRect.w}px above expected 288`
    ).toBeLessThan(300)
  })

  /*
   * On the smallest supported width (320 vw, iPhone SE 1st-gen). The
   * clamp `calc(100vw - 2 * var(--fab-margin, 16px))` was written
   * specifically so the popup can't slide off-screen at 320 px. Guard
   * that separately from the 375 vw layout test.
   */
  test.describe('320 vw viewport', () => {
    test.use({ viewport: { width: 320, height: 568 } })
    test('drawer stays inside the viewport', async ({ page }) => {
      await page.goto('/')
      await openDrawer(page)
      const geom = await page.locator('.mobile-popup').evaluate(el => {
        const r = el.getBoundingClientRect()
        return {
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        }
      })
      expect(
        geom.left,
        `left=${geom.left}px is negative`
      ).toBeGreaterThanOrEqual(0)
      expect(
        geom.right,
        `right=${geom.right}px overflows 320`
      ).toBeLessThanOrEqual(320)
    })
  })
})
