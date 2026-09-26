import { click, expect, expectVisible, test } from '@prometheus/e2e-toolkit'
import { TESTID } from '../src/redesign/testids'
import { bootRedesign, goRoute, SLOW } from './helpers/redesign-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'

/**
 * The site's languages and its curated links directory were editable only in
 * the client that is no longer served — this screen showed languages
 * read-only and had no links surface at all. Both now write the same
 * settings files, so this covers the round-trip that makes retiring the old
 * client a removal of code rather than of capability.
 */

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

const anchor = (id: string): string => `[data-testid="${id}"]`

test('settings: the site languages are editable and reach the repository', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const label = `Русский ${(Date.now() % 1e6).toString(36)}`

  await bootRedesign(page, 'redesign-settings-langs')
  await goRoute(page, 'settings', 'settings')

  const section = page.locator(anchor(TESTID.settingsLanguages))
  await expectVisible(page, section, SLOW)
  const rows = section.locator('.lang-row')
  const before = await rows.count()
  expect(before, 'the baseline seeds several languages').toBeGreaterThan(1)

  /* Rename one language: the smallest edit that proves the whole document is
   * read, changed and written back intact. */
  await rows
    .first()
    .locator('cp-input')
    .nth(1)
    .getByRole('textbox')
    .fill(label)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.settingsSaveLanguages)), SLOW)
  await waitForHeadAdvance(shaBefore)

  const remote = await readFile('settings/languages.json')
  expect(remote, 'settings/languages.json must still exist').toBeTruthy()
  const parsed: readonly { code: string; label: string }[] = JSON.parse(
    remote ?? '[]'
  )
  expect(parsed, 'no language may be lost by an edit').toHaveLength(before)
  expect(parsed.map(entry => entry.label)).toContain(label)
})

test('settings: a duplicated language code is refused before anything is written', async ({
  page,
}) => {
  test.setTimeout(180_000)

  await bootRedesign(page, 'redesign-settings-dupe')
  await goRoute(page, 'settings', 'settings')

  const section = page.locator(anchor(TESTID.settingsLanguages))
  await expectVisible(page, section, SLOW)
  const rows = section.locator('.lang-row')
  const first = await rows
    .first()
    .locator('cp-input')
    .first()
    .getByRole('textbox')
    .inputValue()

  /* Point the second language at the first one's code: one of them would
   * become unreachable, so the write must not happen at all. */
  await rows
    .nth(1)
    .locator('cp-input')
    .first()
    .getByRole('textbox')
    .fill(first)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.settingsSaveLanguages)), SLOW)
  await expectVisible(page, section.locator('.bad'), SLOW)
  expect(
    await headSha(),
    'a refused save must leave the repository alone'
  ).toBe(shaBefore)
})

test('settings: the links directory is editable and reaches the repository', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const name = `Ссылка ${(Date.now() % 1e6).toString(36)}`

  await bootRedesign(page, 'redesign-settings-links')
  await goRoute(page, 'settings', 'settings')

  const section = page.locator(anchor(TESTID.settingsLinks))
  await expectVisible(page, section, SLOW)
  const before = await section.locator('.link-row').count()

  await click(page, section.getByRole('button', { name: '+ ссылка' }), SLOW)
  const added = section.locator('.link-row').nth(before)
  await expectVisible(page, added, SLOW)
  await added
    .locator('cp-input')
    .first()
    .getByRole('textbox')
    .fill('https://example.org')
  await added.locator('cp-input').nth(1).getByRole('textbox').fill(name)
  /* The baseline carries no links.json, so this is the first entry and it
   * names its own section — the directory has none to choose from yet. */
  await added.locator('cp-input').nth(2).getByRole('textbox').fill('friendly')

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.settingsSaveLinks)), SLOW)
  await waitForHeadAdvance(shaBefore)

  const remote = await readFile('settings/links.json')
  const parsed: {
    groups: string[]
    entries: { url: string; name: string }[]
  } = JSON.parse(remote ?? '{"groups":[],"entries":[]}')
  expect(parsed.entries, 'the new link must be in the file').toHaveLength(
    before + 1
  )
  expect(parsed.entries.map(entry => entry.name)).toContain(name)
  expect(
    parsed.groups.length,
    'the groups must survive an entry edit'
  ).toBeGreaterThan(0)
})

test('settings: a link with no section is refused before anything is written', async ({
  page,
}) => {
  test.setTimeout(180_000)

  await bootRedesign(page, 'redesign-settings-links-bad')
  await goRoute(page, 'settings', 'settings')

  const section = page.locator(anchor(TESTID.settingsLinks))
  await expectVisible(page, section, SLOW)
  const before = await section.locator('.link-row').count()

  await click(page, section.getByRole('button', { name: '+ ссылка' }), SLOW)
  const added = section.locator('.link-row').nth(before)
  await expectVisible(page, added, SLOW)
  await added
    .locator('cp-input')
    .first()
    .getByRole('textbox')
    .fill('https://example.org')

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.settingsSaveLinks)), SLOW)
  await expectVisible(page, section.locator('.bad'), SLOW)
  expect(
    await headSha(),
    'a refused save must leave the repository alone'
  ).toBe(shaBefore)
})
