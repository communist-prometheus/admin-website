import {
  click,
  expect,
  expectVisible,
  fill,
  type Page,
} from '@prometheus/e2e-toolkit'
import { SLOW } from './realmode-page'

/**
 * Drive the "+ New" create dialog from a content list page through
 * to the editor view. The current dialog stores the draft in
 * sessionStorage and navigates — no API call yet — so the editor
 * showing up is the only synchronous signal.
 * @param page - Playwright page on a /content/<type> list
 * @param slug - New content slug (also becomes the directory name)
 * @param title - Title text seeded into the frontmatter
 * @param category - Optional category KEY (matches labels.json)
 */
export const fillCreateDialog = async (
  page: Page,
  slug: string,
  title: string,
  category?: string
): Promise<void> => {
  await click(page, page.locator('[data-testid="create-button"]'), SLOW)
  await expectVisible(page, page.locator('.create-dialog'), SLOW)
  await fill(page, page.locator('#slug'), slug, SLOW)
  await fill(page, page.locator('#title'), title, SLOW)
  if (category) await page.locator('#category').selectOption(category)
  await click(page, page.locator('[data-testid="create-submit"]'), SLOW)
  /* Dialog closes synchronously and the route flips to the editor. */
  await page.waitForURL(new RegExp(`/edit/${slug}(\\?|$)`))
  await expect(page).toHaveURL(new RegExp(`/edit/${slug}(\\?|$)`))
}
