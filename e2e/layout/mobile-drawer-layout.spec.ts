import { expect, test, waitForCondition } from '@prometheus/e2e-toolkit'

/*
 * Guard the mobile drawer geometry.
 *
 * Design: the mobile drawer is TWO stacked popups. The main drawer is
 * always mounted while the FAB is toggled open — its rows never move,
 * never expand, never collapse. When the user taps a group row a
 * SECOND popup (mobile-submenu) appears on top of the main drawer with
 * a small offset so both layers stay visible. Tapping another group
 * swaps the submenu's content in place; tapping the same row toggles
 * it closed; tapping any nav link closes the whole thing.
 *
 * Regressions this file guards:
 *   - PR #350: `:global(details[open]) .chevron` shipped as
 *     `details[open] { transform: rotate(90deg) }` and character-
 *     wrapped every label.
 *   - PR #353 accordion: expanding a group changed the drawer height
 *     and shifted siblings ("прыгающее меню").
 *   - PR #356 drilldown: tapping a group swapped the drawer's ENTIRE
 *     content, so the main list disappeared under the tap
 *     ("переёбывается всё меню").
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

  test('main drawer shows all group rows always', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    /*
     * Home link + group rows for each visible group. No section items
     * are rendered in the main drawer — those live in the submenu.
     */
    const groupRows = page.locator('[data-testid^="mobile-nav-group-"]')
    await expect(groupRows).not.toHaveCount(0)
    /* Home is the only MobileNavLink on the main drawer. */
    const rootLinks = await page
      .locator('.mobile-popup a.mobile-nav-link')
      .evaluateAll(links => links.map(l => l.textContent?.trim() ?? ''))
    expect(rootLinks).toEqual(['Home'])
  })

  test('tapping a group opens the submenu WITHOUT replacing the main drawer', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.getByTestId('mobile-nav-group-community').click()
    await expect(page.getByTestId('mobile-submenu')).toBeVisible()
    /*
     * The main drawer stays visible AND every group row is still in the
     * DOM. This is the exact scenario PR #356 broke: the drilldown
     * swapped the drawer's content and the user saw the main list
     * vanish under their tap. Guard it by name.
     */
    for (const row of ['content', 'community', 'distribution', 'admin']) {
      await expect(page.getByTestId(`mobile-nav-group-${row}`)).toBeVisible()
    }
    /* Section items visible on the submenu overlay. */
    const submenuLinks = await page
      .getByTestId('mobile-submenu')
      .locator('a.mobile-nav-link')
      .evaluateAll(links => links.map(l => l.textContent?.trim()))
    expect(submenuLinks).toContain('Labels')
    expect(submenuLinks).toContain('Tickets')
  })

  test('tapping another group swaps the submenu content, main unchanged', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.getByTestId('mobile-nav-group-community').click()
    await expect(
      page
        .getByTestId('mobile-submenu')
        .getByRole('link', { name: /labels/i })
    ).toBeVisible()

    /* Snapshot the main drawer height + row positions. */
    const rowsBefore = await page
      .locator('[data-testid^="mobile-nav-group-"]')
      .evaluateAll(rows =>
        rows.map(r => ({
          slug: (r.getAttribute('data-testid') ?? '').replace(
            'mobile-nav-group-',
            ''
          ),
          y: Math.round(r.getBoundingClientRect().top),
        }))
      )

    /* Close current submenu, then open a different one. */
    await page.getByTestId('mobile-submenu-close').click()
    await page.getByTestId('mobile-nav-group-content').click()
    await expect(
      page.getByTestId('mobile-submenu').getByRole('link', { name: /blog/i })
    ).toBeVisible()

    const rowsAfter = await page
      .locator('[data-testid^="mobile-nav-group-"]')
      .evaluateAll(rows =>
        rows.map(r => ({
          slug: (r.getAttribute('data-testid') ?? '').replace(
            'mobile-nav-group-',
            ''
          ),
          y: Math.round(r.getBoundingClientRect().top),
        }))
      )
    /* No jumping — every group row keeps its y-position after swap. */
    expect(rowsAfter).toEqual(rowsBefore)
  })

  test('close button dismisses the submenu; main drawer stays open', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.getByTestId('mobile-nav-group-community').click()
    await expect(page.getByTestId('mobile-submenu')).toBeVisible()
    await page.getByTestId('mobile-submenu-close').click()
    await expect(page.getByTestId('mobile-submenu')).toHaveCount(0)
    /* Main drawer group rows still there, unchanged. */
    await expect(page.getByTestId('mobile-nav-group-community')).toBeVisible()
  })

  test('nav-link labels never wrap to a single-character column', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
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
        .getByTestId('mobile-submenu')
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
        expect(d.w, `"${d.text}" width ${d.w}px < 90px`).toBeGreaterThan(90)
        expect(d.h, `"${d.text}" height ${d.h}px > 72px`).toBeLessThan(72)
      }
      /* Close between iterations so next tap isn't blocked by an
         overlapping submenu. */
      await page.getByTestId('mobile-submenu-close').click()
    }
  })

  test('no ancestor of a drawer item has a transform', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    await page.getByTestId('mobile-nav-group-community').click()
    const withTransforms = await page.evaluate(() => {
      type Hit = { tag: string; cls: string; transform: string }
      const isSkippable = (el: Element): boolean => {
        const cn = String(el.className ?? '')
        return cn.includes('mobile-popup') || cn.includes('submenu-popup')
      }
      const collectFor = (link: Element, out: Hit[]): void => {
        let cur: Element | null = link
        while (cur && cur.tagName !== 'BODY') {
          const t = getComputedStyle(cur).transform
          const bad = t !== 'none' && !isSkippable(cur)
          if (bad)
            out.push({
              tag: cur.tagName,
              cls: String(cur.className ?? ''),
              transform: t,
            })
          cur = cur.parentElement
        }
      }
      const results: Hit[] = []
      for (const link of document.querySelectorAll('a.mobile-nav-link'))
        collectFor(link, results)
      return results
    })
    expect(
      withTransforms,
      `Unexpected transforms on ancestors: ${JSON.stringify(withTransforms)}`
    ).toEqual([])
  })

  test('main drawer height stays constant across submenu toggles', async ({
    page,
  }) => {
    await page.goto('/')
    await openDrawer(page)
    const mainH = async (): Promise<number> =>
      page
        .locator('.mobile-popup')
        .evaluate(el => Math.round(el.getBoundingClientRect().height))
    const rootH = await mainH()
    await page.getByTestId('mobile-nav-group-community').click()
    const openH = await mainH()
    await page.getByTestId('mobile-submenu-close').click()
    const closedH = await mainH()
    /*
     * The main drawer's height MUST NOT change when a submenu opens
     * or closes. The whole point of the second-popup pattern is that
     * the main drawer stays stationary.
     */
    expect(openH, `main jumped on submenu open: ${rootH} → ${openH}`).toBe(
      rootH
    )
    expect(
      closedH,
      `main jumped on submenu close: ${rootH} → ${closedH}`
    ).toBe(rootH)
  })

  test('drawer inline-size is bounded by the viewport', async ({ page }) => {
    await page.goto('/')
    await openDrawer(page)
    const overlayRect = await page.locator('.mobile-popup').evaluate(el => {
      const r = el.getBoundingClientRect()
      return { w: Math.round(r.width), h: Math.round(r.height) }
    })
    expect(overlayRect.w).toBeGreaterThan(260)
    expect(overlayRect.w).toBeLessThan(300)
  })

  test.describe('320 vw viewport', () => {
    test.use({ viewport: { width: 320, height: 568 } })
    test('drawer + submenu stay inside the viewport', async ({ page }) => {
      await page.goto('/')
      await openDrawer(page)
      const main = await page.locator('.mobile-popup').evaluate(el => {
        const r = el.getBoundingClientRect()
        return { left: Math.round(r.left), right: Math.round(r.right) }
      })
      expect(main.left).toBeGreaterThanOrEqual(0)
      expect(main.right).toBeLessThanOrEqual(320)

      await page.getByTestId('mobile-nav-group-community').click()
      const sub = await page.getByTestId('mobile-submenu').evaluate(el => {
        const r = el.getBoundingClientRect()
        return { left: Math.round(r.left), right: Math.round(r.right) }
      })
      expect(sub.left).toBeGreaterThanOrEqual(0)
      expect(sub.right).toBeLessThanOrEqual(320)
    })
  })
})
