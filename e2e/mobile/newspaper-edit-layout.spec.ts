import { expect, test } from '@prometheus/e2e-toolkit'
import { MOBILE_FAB } from '../helpers/mobile-constants'

/**
 * Regression for the broken mobile layout on /content/newspaper/edit
 * at iPhone-class viewports.
 *
 * Two visible bugs that this test pins:
 *
 * 1. The `EditorFooter` had `position: sticky; bottom: 0`. Its sticky
 *    containing block was `.edit-body-area`, which on a newspaper edit
 *    page sits entirely below the viewport at scroll=0 (frontmatter +
 *    articles picker push it past 812px on iPhone 12 Pro). Sticky
 *    clamps to the parent's TOP when its target (`bottom: 0` against
 *    viewport-bottom) falls outside the parent — so the Preview
 *    footer rendered on TOP of the "SOURCE FILES" header instead of
 *    after the dropzones.
 *
 * 2. The `AddArticleRow` "Add" button sat in the bottom-right area
 *    where the global MobileMenu FAB lives (fixed, ~56px,
 *    bottom-right). At certain scroll positions the FAB rendered on
 *    top of the Add button.
 *
 * Asserts:
 *   - The Preview button is positioned AFTER the SOURCE FILES section
 *     (natural flow, no sticky overlap).
 *   - The Preview button does not intersect the floating FAB.
 *   - The "Add" button on the articles-picker does not intersect the
 *     floating FAB.
 */
test.describe('Newspaper edit — mobile layout', () => {
  test('Preview button sits after source uploads (no sticky overlap)', async ({
    page,
  }) => {
    await page.goto('/content/newspaper/edit/issue-1')
    const sources = page.getByTestId('newspaper-source-uploads')
    const preview = page.getByTestId('preview-button')
    await expect(sources).toBeVisible()
    await expect(preview).toBeVisible()
    const sourcesBox = await sources.boundingBox()
    const previewBox = await preview.boundingBox()
    expect(sourcesBox).not.toBeNull()
    expect(previewBox).not.toBeNull()
    if (!sourcesBox || !previewBox) return
    /*
     * Preview must start AT OR BELOW the bottom of source uploads.
     * Pre-fix the sticky footer clamped to the top of the section
     * and rendered ON TOP of the "SOURCE FILES" header.
     */
    expect(previewBox.y).toBeGreaterThanOrEqual(
      sourcesBox.y + sourcesBox.height - 1
    )
  })

  test('Preview and Add buttons do not collide with the FAB', async ({
    page,
  }) => {
    await page.goto('/content/newspaper/edit/issue-1')
    const fab = page.getByTestId(MOBILE_FAB)
    const preview = page.getByTestId('preview-button')
    const add = page.getByTestId('article-add')
    await expect(fab).toBeVisible()
    await expect(preview).toBeVisible()
    await expect(add).toBeVisible()
    const fabBox = await fab.boundingBox()
    const previewBox = await preview.boundingBox()
    const addBox = await add.boundingBox()
    expect(fabBox && previewBox && addBox).toBeTruthy()
    if (!fabBox || !previewBox || !addBox) return
    const intersects = (
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number }
    ): boolean =>
      !(
        a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y
      )
    expect(intersects(previewBox, fabBox)).toBe(false)
    expect(intersects(addBox, fabBox)).toBe(false)
  })
})
