import {
  click,
  expect,
  expectVisible,
  fill,
  test,
  visit,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { listDir, readFile } from './helpers/sandbox-read'

const OLD = 'welcome'

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('rename slug rewrites the directory in a single commit', async ({
  page,
}) => {
  test.setTimeout(180_000)
  /* Per-run unique slug, ≤ 20 chars (validate-slug.ts limit).
   * `Date.now() % 1e6` keeps the suffix readable but unique enough
   * across same-day runs of the suite. Module-scope Date.now()
   * breaks Playwright discovery — see create-blog.spec.ts. */
  const fresh = `renamed-${(Date.now() % 1e6).toString(36)}`

  await bootRealmode(page, 'rename-blog')
  await visit(page, `/content/blog/edit/${OLD}`, SLOW)
  await expectVisible(page, page.locator('[data-testid="editor-body"]'), SLOW)

  const shaBefore = await headSha()
  await click(page, page.locator('[data-testid="edit-title"]'), SLOW)

  /* The slug input is rendered AFTER `editing` flips to true on
   * the Vue side. expectVisible waits for the actual mount before
   * we write into it. */
  const slugInput = page.locator('[data-testid="slug-input"]')
  await expectVisible(page, slugInput, SLOW)
  await fill(page, slugInput, fresh, SLOW)
  /* The confirm handler is on `@keydown` of the input element, so
   * the Enter key must dispatch on the input itself rather than on
   * `document.body`. `locator.press` keeps focus where the input
   * already is. */
  await slugInput.press('Enter')

  /* The handler does `globalThis.location.replace(...)` synchronously
   * on success — wait for the URL to flip before chasing the SHA so
   * a stuck rename produces a useful "still on /edit/welcome" failure
   * instead of a generic "push never landed". */
  await waitForCondition(
    page,
    async () => page.url().includes(`/edit/${fresh}`),
    SLOW
  )

  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const old = await listDir(`blog/${OLD}`)
  expect(old, `blog/${OLD} must be gone`).toEqual([])
  const renamed = await readFile(`blog/${fresh}/index.en.md`)
  expect(renamed, `blog/${fresh}/index.en.md must exist`).toBeTruthy()
})
