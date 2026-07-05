import { expect, test, waitForCondition } from '@prometheus/e2e-toolkit'

/*
 * Guard the mobile drawer geometry.
 *
 * Two prior regressions this file catches:
 *  1. PR #350 shipped a `:global(details[open]) .chevron` rule that
 *     Vue silently reduced to `details[open] { transform: rotate(90deg) }`,
 *     rotating every open <details> and character-wrapping labels.
 *  2. PR #353 introduced a "jumpy" accordion — expanding a group
 *     changed the drawer height and shifted siblings, which the user
 *     called "прыгающее меню".
 *
 * The current design is drilldown: main panel shows one row per group,
 * tapping a group replaces the panel with a submenu (back + items).
 * Drawer height stays constant; nothing jumps.
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

  test('root panel shows one row per group, no expanded links', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    /*
     * Root: Home + Content + Community + Distribution + Admin + auth.
     * Group ROWS are buttons with data-testid=mobile-nav-group-<title>;
     * no MobileNavLink for section items visible until the user drills in.
     */
    const groupRows = page.locator('[data-testid^="mobile-nav-group-"]')
    await expect(groupRows).not.toHaveCount(0)
    /*
     * Section items (Blog, Positions, Newsletter, etc.) MUST NOT
     * appear on the root panel — that's the accordion behaviour we
     * ripped out. Only Home is a MobileNavLink at the root.
     */
    const rootLinks = page.locator('a.mobile-nav-link')
    const rootLinkTexts = await rootLinks.evaluateAll(links =>
      links.map(l => l.textContent?.trim() ?? '')
    )
    expect(rootLinkTexts).toEqual(['Home'])
  })

  test('tapping a group row drills into a submenu with a back button', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    /*
     * Community group has role-independent items (Labels, Tickets)
     * available to every editor.
     */
    await page.getByTestId('mobile-nav-group-community').click()
    await expect(page.getByTestId('mobile-submenu')).toBeVisible()
    await expect(page.getByTestId('mobile-submenu-back')).toBeVisible()
    /* Section items now visible. */
    const submenuLinks = await page
      .locator('a.mobile-nav-link')
      .evaluateAll(links => links.map(l => l.textContent?.trim()))
    expect(submenuLinks).toContain('Labels')
    expect(submenuLinks).toContain('Tickets')
    /* Root-panel group rows are hidden while the submenu is open. */
    await expect(page.getByTestId('mobile-nav-group-content')).toHaveCount(0)
  })

  test('back button returns to the root panel', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.getByTestId('mobile-nav-group-community').click()
    await page.getByTestId('mobile-submenu-back').click()
    await expect(page.getByTestId('mobile-submenu')).toHaveCount(0)
    await expect(page.getByTestId('mobile-nav-group-community')).toBeVisible()
  })

  test('landing on a section auto-drills into its submenu', async ({
    page,
  }) => {
    /* Blog lives under Content — the drawer should open at Content submenu. */
    await page.goto('/content/blog')
    await openDrawer(page)
    await expect(page.getByTestId('mobile-submenu')).toBeVisible()
    const backLabel = await page
      .getByTestId('mobile-submenu-back')
      .textContent()
    expect(backLabel?.toLowerCase()).toContain('content')
  })

  test('nav-link labels never wrap to a single-character column', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    /* Drill into each group in sequence and measure its items. */
    const groupSlugs = await page
      .locator('[data-testid^="mobile-nav-group-"]')
      .evaluateAll(rows =>
        rows.map(r =>
          (r.getAttribute('data-testid') ?? '').replace(
            'mobile-nav-group-',
            ''
          )
        )
      )
    for (const slug of groupSlugs) {
      await page.getByTestId(`mobile-nav-group-${slug}`).click()
      const dims = await page
        .locator('a.mobile-nav-link')
        .evaluateAll(links =>
          links.map(l => {
            const r = l.getBoundingClientRect()
            return {
              text: l.textContent?.trim() ?? '',
              w: Math.round(r.width),
              h: Math.round(r.height),
            }
          })
        )
      for (const d of dims) {
        /*
         * A single glyph at the drawer's font size is ~15 px; any link
         * under 90 px on a 375 vw viewport means the label has been
         * character-wrapped (the PR #350 rotation bug). Height above
         * 3 lines (72 px) is the upper bound.
         */
        expect(d.w, `"${d.text}" width ${d.w}px < 90px`).toBeGreaterThan(90)
        expect(d.h, `"${d.text}" height ${d.h}px > 72px`).toBeLessThan(72)
      }
      await page.getByTestId('mobile-submenu-back').click()
    }
  })

  test('no ancestor of a drawer item has a transform', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.getByTestId('mobile-nav-group-community').click()

    /*
     * Guard for the PR #350 class of regression — a global
     * `details[open] { transform: rotate(90deg) }` sneaked in via
     * `:global()`. Walk every drawer link's ancestor chain and assert
     * nobody carries a transform (except .mobile-popup, which uses
     * translateY for its opening animation).
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

  test('drawer height does not jump between root and submenu', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    const heightAt = async (): Promise<number> =>
      page
        .locator('.mobile-popup')
        .evaluate(el => Math.round(el.getBoundingClientRect().height))
    const rootH = await heightAt()
    await page.getByTestId('mobile-nav-group-community').click()
    const commH = await heightAt()
    await page.getByTestId('mobile-submenu-back').click()
    const rootH2 = await heightAt()
    /*
     * With drilldown, root and submenu don't share the same height
     * (each panel has different row counts), but the drawer must
     * return to EXACTLY the root height when back-navigation lands
     * home — no ghost row, no residual submenu offset.
     */
    expect(
      rootH2,
      `root height changed after back: ${rootH} → ${rootH2}`
    ).toBe(rootH)
    /* And each panel's height must fit inside the visible viewport. */
    expect(rootH).toBeLessThanOrEqual(812)
    expect(commH).toBeLessThanOrEqual(812)
  })

  test('drawer inline-size is bounded by the viewport', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    const overlayRect = await page.locator('.mobile-popup').evaluate(el => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })
    expect(
      overlayRect.w,
      `drawer width ${overlayRect.w}px too narrow`
    ).toBeGreaterThan(260)
    expect(
      overlayRect.w,
      `drawer width ${overlayRect.w}px above expected 288`
    ).toBeLessThan(300)
  })

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
