import {
  click,
  expect,
  expectVisible,
  test,
  visit,
} from '@prometheus/e2e-toolkit'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { listDir } from './helpers/sandbox-read'

const TARGET_SLUG = 'welcome'

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('delete blog: "Delete all languages" removes the slug directory', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'delete-all-langs')
  await visit(page, '/content/blog', SLOW)

  const card = page
    .locator('article.content-item')
    .filter({ hasText: 'Welcome to the sandbox' })
  await expectVisible(page, card, SLOW)

  const shaBefore = await headSha()
  /* `visibility: hidden` on .delete-btn until hover — explicit hover
   * unblocks the actionability check. */
  await card.hover()
  await click(page, card.locator('[data-testid="delete-item-btn"]'), SLOW)
  await click(page, page.locator('[data-testid="delete-all-btn"]'), SLOW)

  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const remaining = await listDir(`blog/${TARGET_SLUG}`)
  expect(remaining, 'whole slug directory must be gone').toEqual([])
})
