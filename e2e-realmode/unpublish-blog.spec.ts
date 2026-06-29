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

const PUBLISHED_TRUE = /^published:\s+true\s*$/m
const PUBLISHED_FALSE = /^published:\s+false\s*$/m

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

// Reproduction for the prod report: "I unchecked Publish, it redeployed,
// but the article did NOT leave the public site." The public build only
// ships blog entries with `published === true`, so unpublishing has to
// rewrite the frontmatter to `published: false` AND that commit has to
// reach the remote. This exercises the REAL service-worker git push
// (isomorphic-git → sandbox repo), not the mock store: it polls the
// GitHub ref to prove the unpublish commit actually landed, then reads
// the pushed bytes back and asserts the flag flipped.
test('unpublish: unchecking Publish flips the pushed file to published:false', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'unpublish-blog')
  await visit(page, TARGET, SLOW)

  const editor = page.locator('[data-testid="editor-body"]')
  await expectVisible(page, editor, SLOW)
  // SW finishes its clone before the textarea hydrates — wait on the
  // non-empty value, never a blind timeout.
  await waitForCondition(
    page,
    async () =>
      editor
        .inputValue()
        .then(v => v.length > 0)
        .catch(() => false),
    SLOW
  )

  const publish = page.locator('#fm-published')
  await expectVisible(page, publish, SLOW)

  // Phase 1 — establish a known published state on the remote. Check the
  // box and add a body marker so HEAD always advances regardless of the
  // baseline's initial flag, then confirm the publish.
  const before = await editor.inputValue()
  const marker = `<!-- realmode unpublish ${Date.now()} -->`
  await fill(page, editor, `${before}\n\n${marker}`, SLOW)
  await publish.check()
  const sha0 = await headSha()
  await saveAndConfirm(page)
  await waitForHeadAdvance(sha0)

  const published = await readFile(FILE)
  expect(published, `${FILE} must exist on sandbox`).toBeTruthy()
  expect(published ?? '', 'phase-1 file is published').toMatch(PUBLISHED_TRUE)

  // Phase 2 — the actual bug: UNcheck Publish and save. A draft save has
  // no confirm dialog. The pushed file must flip to `published: false`.
  await publish.uncheck()
  const sha1 = await headSha()
  await saveAndConfirm(page)
  await waitForHeadAdvance(sha1)

  const unpublished = await readFile(FILE)
  expect(unpublished, `${FILE} must exist on sandbox`).toBeTruthy()
  expect(unpublished ?? '', 'unpublish reached the remote').toMatch(
    PUBLISHED_FALSE
  )
  expect(unpublished ?? '', 'no stale published:true remains').not.toMatch(
    PUBLISHED_TRUE
  )

  // What admin commits must still parse against public-website's schema.
  await assertAstroAccepts('blog', unpublished ?? '')
})
