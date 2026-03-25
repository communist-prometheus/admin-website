import { expect, test } from '@playwright/test'
import { MOBILE_FAB } from './constants'
import { dragFab } from './drag-fab'

test.describe('FAB Drag', () => {
  test('dragging FAB to top-left snaps correctly', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByTestId(MOBILE_FAB)
    await dragFab(page, fab, 50, 50)
    const after = await fab.boundingBox()
    expect(after?.x).toBeLessThan(100)
    expect(after?.y).toBeLessThan(100)
  })

  test('FAB position persists after reload', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByTestId(MOBILE_FAB)
    await dragFab(page, fab, 50, 50)
    await page.reload()
    const after = await page.getByTestId(MOBILE_FAB).boundingBox()
    expect(after?.x).toBeLessThan(100)
    expect(after?.y).toBeLessThan(100)
  })

  test('dragging back to bottom-right works', async ({ page }) => {
    await page.goto('/')
    const fab = page.getByTestId(MOBILE_FAB)
    await dragFab(page, fab, 350, 800)
    const after = await fab.boundingBox()
    expect(after?.x).toBeGreaterThan(250)
    expect(after?.y).toBeGreaterThan(700)
  })
})
