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
import { readFile } from './helpers/sandbox-read'

const TARGET_SLUG = 'welcome'
const FILE = `blog/${TARGET_SLUG}/index.en.md`

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('delete blog: "Delete only en" removes the lang file', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'delete-blog')
  await visit(page, '/content/blog', SLOW)

  const card = page
    .locator('article.content-item')
    .filter({ hasText: 'Welcome to the sandbox' })
  /* Wait for the card so the SW finished its initial clone. */
  await expectVisible(page, card, SLOW)

  const shaBefore = await headSha()
  /* The delete button is `visibility: hidden` until hover — without
   * an explicit hover the actionability check waits forever. */
  await card.hover()
  await click(page, card.locator('[data-testid="delete-item-btn"]'), SLOW)
  await click(page, page.locator('[data-testid="delete-lang-btn"]'), SLOW)

  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const remote = await readFile(FILE)
  expect(remote, `${FILE} must be gone on sandbox`).toBeUndefined()
})
