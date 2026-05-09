import {
  expect,
  expectVisible,
  fill,
  test,
  visit,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { assertAstroAccepts } from './helpers/astro-validate'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'
import { saveAndConfirm } from './helpers/save-flow'

const TARGET = '/content/blog/edit/welcome'
const FILE = 'blog/welcome/index.en.md'

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('save: editing welcome.en.md reaches the sandbox repo', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'save-blog')
  await visit(page, TARGET, SLOW)

  const editor = page.locator('[data-testid="editor-body"]')
  await expectVisible(page, editor, SLOW)
  /* SW finishes its clone before the editor textarea hydrates.
   * Wait for non-empty value via the request-graph primitive
   * rather than a blind timeout. */
  await waitForCondition(
    page,
    async () =>
      editor
        .inputValue()
        .then(v => v.length > 0)
        .catch(() => false),
    SLOW
  )

  const before = await editor.inputValue()
  const shaBefore = await headSha()
  const marker = `<!-- realmode save ${Date.now()} -->`
  await fill(page, editor, `${before}\n\n${marker}`, SLOW)
  await saveAndConfirm(page)

  /* Network-side success: the green "Saved" badge in the UI only
   * proves the local commit landed; polling the GH ref is what
   * makes a hung or rejected push fail loudly. */
  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter, 'sandbox HEAD advanced').not.toBe(shaBefore)

  const remote = await readFile(FILE)
  expect(remote, `${FILE} must exist on sandbox`).toBeTruthy()
  expect(remote, 'commit must include the in-test marker').toContain(marker)

  /* Contract: what admin commits MUST be acceptable to public-
   * website's astro collection schema. The drift test
   * (astro-schema-drift.spec.ts) keeps the mirror honest; this call
   * proves the actual bytes admin produced parse against it. */
  await assertAstroAccepts('blog', remote ?? '')
})
