import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'
import { assertAstroAccepts } from './helpers/astro-validate'
import { fillCreateDialog } from './helpers/create-flow'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'
import { saveAndConfirm } from './helpers/save-flow'

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('create blog: New → fill → Save commits a fresh slug', async ({
  page,
}) => {
  test.setTimeout(180_000)
  /* Slug is computed inside the test body, not at module scope —
   * a Date.now() in the test title would differ between discovery
   * and the worker fork ("Test not found in the worker process").
   * `validate-slug.ts` caps slugs at 20 chars; the truncated
   * timestamp keeps the suffix unique without overflowing. */
  const slug = `rm-create-${(Date.now() % 1e6).toString(36)}`

  await bootRealmode(page, 'create-blog')
  await visit(page, '/content/blog', SLOW)

  const shaBefore = await headSha()
  await fillCreateDialog(page, slug, 'Realmode created article', 'general')
  await expectVisible(page, page.locator('[data-testid="editor-body"]'), SLOW)

  await saveAndConfirm(page)
  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const path = `blog/${slug}/index.en.md`
  const remote = await readFile(path)
  expect(remote, `${path} must exist on sandbox`).toBeTruthy()
  expect(remote, 'frontmatter must include the title we typed').toContain(
    'Realmode created article'
  )
  /* Mirror the save-blog contract: a freshly-created article must
   * parse against astro's schema before it lands on develop. */
  await assertAstroAccepts('blog', remote ?? '')
})
