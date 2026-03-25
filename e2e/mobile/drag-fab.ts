import type { Locator, Page } from '@playwright/test'

/**
 * Simulate a pointer drag from FAB center to target coords.
 * @param page - Playwright page
 * @param fab - FAB locator
 * @param tx - Target X coordinate
 * @param ty - Target Y coordinate
 */
export const dragFab = async (
  page: Page,
  fab: Locator,
  tx: number,
  ty: number
) => {
  const box = await fab.boundingBox()
  if (!box) throw new Error('FAB not visible')
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(tx, ty, { steps: 20 })
  await page.mouse.up()
}
