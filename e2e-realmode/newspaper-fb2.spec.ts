import { expect, expectVisible, test, visit } from '@prometheus/e2e-toolkit'
import { assertAstroAccepts } from './helpers/astro-validate'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'
import { saveAndConfirm } from './helpers/save-flow'

const SLUG = 'issue-1'
const FB2_BODY = '<?xml version="1.0" encoding="UTF-8"?>\n<FictionBook/>\n'

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('newspaper FB2 upload commits sources to assets/<slug>.<lang>.fb2', async ({
  page,
}) => {
  test.setTimeout(180_000)
  await bootRealmode(page, 'newspaper-fb2')
  await visit(page, `/content/newspaper/edit/${SLUG}`, SLOW)
  /* Newspaper edit doesn't mount a Markdown body editor — the
   * source-uploads section is what tells us the SW finished its
   * clone and the editor is interactive. */
  await expectVisible(
    page,
    page.locator('[data-testid="newspaper-source-uploads"]'),
    SLOW
  )

  /* Fb2Upload renames any uploaded file to `<slug>.<lang>.fb2`
   * regardless of the source filename — committing that exact name
   * is the regression contract (#225 broke this once already, and
   * #231 made it per-lang so EN and IT can coexist). The default
   * lang on `/content/newspaper/edit/...` is EN, so the expected
   * path is `<slug>.en.fb2`. */
  await page
    .locator('[data-testid="fb2-dropzone"] + input[type="file"]')
    .setInputFiles({
      name: 'whatever.fb2',
      mimeType: 'application/x-fictionbook+xml',
      buffer: Buffer.from(FB2_BODY, 'utf8'),
    })
  await expectVisible(page, page.locator('[data-testid="fb2-current"]'), SLOW)

  const shaBefore = await headSha()
  await saveAndConfirm(page)
  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const path = `newspaper/${SLUG}/assets/${SLUG}.en.fb2`
  const remote = await readFile(path)
  expect(remote, `${path} must exist on sandbox`).toBeTruthy()
  expect(remote).toContain('FictionBook')

  /* The newspaper issue's frontmatter (committed as part of the
   * same save) must also pass astro — saving a binary that lives
   * next to a missing/invalid index.<lang>.md is still a broken
   * deploy. */
  const issueIndex = await readFile(`newspaper/${SLUG}/index.en.md`)
  await assertAstroAccepts('newspaper', issueIndex ?? '')
})
