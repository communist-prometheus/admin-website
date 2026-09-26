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
 * The flow that shipped broken and stayed green for weeks: the "new
 * material" button opened a blank document that could never be published. A
 * realmode spec for creating an article existed the whole time — against
 * the previous client, which the build stopped serving. This one drives
 * the app an editor actually opens.
 */

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

const anchor = (id: string): string => `[data-testid="${id}"]`

test('create material: blank document → address → publish commits a new file', async ({
  page,
}) => {
  test.setTimeout(180_000)
  /* Computed in the body, not at module scope: a Date.now() in the title
   * differs between discovery and the worker fork. */
  const slug = `rd-create-${(Date.now() % 1e6).toString(36)}`

  await bootRedesign(page, 'redesign-create-material')
  await goRoute(page, 'articles', 'articles')

  await click(page, page.locator(anchor(TESTID.createMaterial)), SLOW)
  // A material with no file yet reports an empty path — that is its identity.
  await expectEditorOn(page, '')

  await page
    .locator(anchor(TESTID.editorTitle))
    .fill('Realmode redesign article')
  await page
    .locator(anchor(TESTID.editorAddress))
    .getByRole('textbox')
    .fill(slug)
  /* The site's schema requires a category, so choosing one is part of
   * creating a material, not an optional flourish. */
  await page
    .getByRole('combobox', { name: 'Рубрика' })
    .selectOption('programme')

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.publish)), SLOW)

  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.publishDialog)}[data-state="done"]`),
    SLOW
  )

  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const path = `blog/${slug}/index.ru.md`
  const remote = await readFile(path)
  expect(remote, `${path} must exist on the sandbox`).toBeTruthy()
  expect(
    remote,
    'the title typed into the heading must reach the file'
  ).toContain('Realmode redesign article')
  /* A created article has to satisfy the site's schema before it can land,
   * exactly as an edited one does. */
  await assertAstroAccepts('blog', remote ?? '')

  // The editor adopts the address it just created, so a second publish
  // edits that file instead of trying to create it again.
  await expectEditorOn(page, path)
})

test('create material: an address already in use is refused before any write', async ({
  page,
}) => {
  test.setTimeout(120_000)

  await bootRedesign(page, 'redesign-create-taken')
  await goRoute(page, 'articles', 'articles')

  // Any slug the baseline already carries; the list proves it exists.
  const taken = await page
    .locator(anchor(TESTID.articleRow))
    .first()
    .getAttribute('data-slug')
  expect(taken, 'the baseline must list at least one article').toBeTruthy()

  await click(page, page.locator(anchor(TESTID.createMaterial)), SLOW)
  await expectEditorOn(page, '')

  await page.locator(anchor(TESTID.editorTitle)).fill('Collision')
  await page
    .locator(anchor(TESTID.editorAddress))
    .getByRole('textbox')
    .fill(taken ?? '')

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.publish)), SLOW)

  await expectVisible(
    page,
    page.locator(`${anchor(TESTID.publishDialog)}[data-state="failed"]`),
    SLOW
  )
  expect(
    await headSha(),
    'a refused publish must not touch the repository'
  ).toBe(shaBefore)
})
