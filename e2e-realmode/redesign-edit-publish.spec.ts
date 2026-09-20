import { click, expect, expectVisible, test } from '@prometheus/e2e-toolkit'
import { TESTID } from '../src/redesign/testids'
import { assertAstroAccepts } from './helpers/astro-validate'
import {
  bootRedesign,
  expectEditorOn,
  goRoute,
  SLOW,
} from './helpers/redesign-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'

/**
 * Editing an existing material and publishing it: the single most-used
 * path in the admin, and until now covered only against the client that
 * is no longer served.
 */

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

const anchor = (id: string): string => `[data-testid="${id}"]`

/** Open the first article the list offers, and report its slug. */
const openFirstArticle = async (
  page: import('@prometheus/e2e-toolkit').Page
) => {
  await goRoute(page, 'articles', 'articles')
  const row = page.locator(anchor(TESTID.articleRow)).first()
  await expectVisible(page, row, SLOW)
  const slug = await row.getAttribute('data-slug')
  expect(slug, 'the baseline must list at least one article').toBeTruthy()
  await click(page, row, SLOW)
  return slug ?? ''
}

test('edit + publish: a changed title reaches the repository', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const title = `Realmode edit ${(Date.now() % 1e6).toString(36)}`

  await bootRedesign(page, 'redesign-edit-publish')
  const slug = await openFirstArticle(page)

  // Wait for the document itself, not for an editor: `data-slug` proves the
  // file the list pointed at is the file on screen.
  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.editorDoc)}[data-slug="${slug}"]`),
    SLOW
  )
  const path = await page
    .locator(anchor(TESTID.editorDoc))
    .getAttribute('data-path')
  expect(path, 'an opened article must be bound to a file').toBeTruthy()

  await page.locator(anchor(TESTID.editorTitle)).fill(title)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.publish)), SLOW)
  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.publishDialog)}[data-state="done"]`),
    SLOW
  )

  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const remote = await readFile(path ?? '')
  expect(remote, `${path} must still exist`).toBeTruthy()
  expect(remote, 'the edited title must be what the file carries').toContain(
    title
  )
  await assertAstroAccepts('blog', remote ?? '')

  // The editor stays on the file it just wrote.
  await expectEditorOn(page, path ?? '')
})

test('edit + publish: an untouched article writes nothing at all', async ({
  page,
}) => {
  test.setTimeout(180_000)

  await bootRedesign(page, 'redesign-edit-idempotent')
  await openFirstArticle(page)
  await expectVisible(page, page.locator(anchor(TESTID.editorDoc)), SLOW)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.publish)), SLOW)
  /* Writing a byte-identical file back is not free: GitHub records an EMPTY
   * commit and the content sync rebuilds the public site for it. Opening an
   * article to read it must cost the repository nothing, so the editor
   * settles on `unchanged` without touching the API at all. */
  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.publishDialog)}[data-state="unchanged"]`),
    SLOW
  )
  expect(
    await headSha(),
    'republishing an untouched article must not move the branch'
  ).toBe(shaBefore)
})
