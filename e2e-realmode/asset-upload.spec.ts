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
import { saveAndConfirm } from './helpers/save-flow'
import { TINY_PNG } from './helpers/tiny-png'

const SLUG = 'welcome'

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

test('asset upload: picker stages asset and Save commits to assets/', async ({
  page,
}) => {
  test.setTimeout(180_000)
  /* Per-run unique filename — module-scope Date.now() differs
   * between discovery and worker processes (see create-blog). */
  const assetName = `rm-asset-${Date.now() % 1e6}.png`
  await bootRealmode(page, 'asset-upload')
  await visit(page, `/content/blog/edit/${SLUG}`, SLOW)
  await expectVisible(page, page.locator('[data-testid="editor-body"]'), SLOW)

  /* The asset upload trigger is a visible button; the file input it
   * proxies to is hidden. setInputFiles bypasses the button entirely
   * — same effect, no scroll/visibility games. */
  await click(page, page.locator('[data-testid="asset-upload-btn"]'), SLOW)
  await page
    .locator('[data-testid="asset-upload-btn"] + input[type="file"]')
    .setInputFiles({
      name: assetName,
      mimeType: 'image/png',
      buffer: TINY_PNG,
    })

  /* Asset thumbnail confirms the in-memory pendingAdds queue has
   * picked it up before we commit. */
  await expectVisible(
    page,
    page.locator('[data-testid="asset-thumbnail"]'),
    SLOW
  )

  const shaBefore = await headSha()
  await saveAndConfirm(page)
  const shaAfter = await waitForHeadAdvance(shaBefore)
  expect(shaAfter).not.toBe(shaBefore)

  const path = `blog/${SLUG}/assets/${assetName}`
  const remote = await readFile(path)
  expect(remote, `${path} must exist on sandbox`).toBeTruthy()
})
