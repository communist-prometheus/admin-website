import {
  expect,
  expectVisible,
  test,
  visit,
  waitForCondition,
} from '@prometheus/e2e-toolkit'
import { wirePageLog } from './helpers/page-log'
import { bootRealmode, SLOW } from './helpers/realmode-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'

const TARGET = '/content/magazine/edit/issue-1'

const titleField = (page: import('@prometheus/e2e-toolkit').Page) =>
  page.locator('input#fm-title')

const langButton = (
  page: import('@prometheus/e2e-toolkit').Page,
  label: string
) => page.locator('button.lang-button', { hasText: label })

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

/* The 2026-05-10 user report: "выбирая газету я не могу сменить
 * язык". Reproducing on prod showed clicking a non-existent lang
 * tab clears the title field, leaving the editor in an empty,
 * frontmatter-less state — directly contradicting the documented
 * intent of `seedFromCurrent` ("entity-level fields preserved when
 * switching to a lang with no file yet"). These tests pin the
 * documented behaviour: clicking a dimmed lang must keep title +
 * description so the user can translate over them; clicking an
 * existing lang must load that file's title. */

test('lang-switch magazine: existing → existing loads target file', async ({
  page,
}) => {
  test.setTimeout(180_000)
  wirePageLog(page, 'lang-switch-exists')
  await bootRealmode(page, 'lang-switch-exists')
  await visit(page, TARGET, SLOW)
  await expectVisible(page, titleField(page), SLOW)

  /* Baseline seeds two langs with distinct titles. */
  await waitForCondition(
    page,
    async () => (await titleField(page).inputValue()) === 'Sandbox issue 1',
    SLOW
  )

  await langButton(page, 'Русский').click()
  await waitForCondition(
    page,
    async () => (await titleField(page).inputValue()) === 'Песочный выпуск 1',
    SLOW
  )
  expect(await titleField(page).inputValue()).toBe('Песочный выпуск 1')
})

test('lang-switch magazine: existing → dimmed preserves frontmatter', async ({
  page,
}) => {
  test.setTimeout(180_000)
  wirePageLog(page, 'lang-switch-seed')
  await bootRealmode(page, 'lang-switch-seed')
  await visit(page, TARGET, SLOW)
  await expectVisible(page, titleField(page), SLOW)
  /* English active, title loaded. */
  await waitForCondition(
    page,
    async () => (await titleField(page).inputValue()) === 'Sandbox issue 1',
    SLOW
  )

  /* Italian is dimmed (no it file in baseline) — the canonical
   * "switch to a brand-new translation" path. seedFromCurrent
   * should preserve title so the user can edit it in place. */
  await langButton(page, 'Italiano').click()
  /* `Italiano` button must be active. */
  await expectVisible(page, langButton(page, 'Italiano'), SLOW)

  const titleAfter = await titleField(page).inputValue()
  expect(
    titleAfter,
    'switching to a dimmed lang must keep the previous title — ' +
      'seedFromCurrent contract'
  ).toBe('Sandbox issue 1')
})

/* The active language button must never carry the `dimmed` class
 * even when the file does not yet exist. Otherwise the click
 * produces ~50%-opacity heading-coloured feedback that reads as
 * "nothing happened" on mobile (2026-05-10 user report:
 * "кликаю кликаю и нихуя не открывается"). Pair the visual-state
 * fix with an explicit "no XYZ version yet" hint below the tabs so
 * the user sees a concrete affordance instead of guessing. */
test('lang-switch magazine: active button drops the dimmed modifier + missing-translation hint shows', async ({
  page,
}) => {
  test.setTimeout(180_000)
  wirePageLog(page, 'lang-switch-active-vis')
  await bootRealmode(page, 'lang-switch-active-vis')
  await visit(page, TARGET, SLOW)
  await expectVisible(page, titleField(page), SLOW)

  await langButton(page, 'Italiano').click()
  await expectVisible(page, langButton(page, 'Italiano'), SLOW)
  const klass =
    (await langButton(page, 'Italiano').getAttribute('class')) ?? ''
  expect(klass, `Italiano class is "${klass}"`).toContain('active')
  expect(klass, 'active button must not carry dimmed').not.toContain('dimmed')

  /* Hint is the unmistakable signal "yes you switched, but no file
   * yet — type and Save". */
  const hint = page.locator('[data-testid="missing-translation-hint"]')
  await expectVisible(page, hint, SLOW)
  await expect(hint).toContainText('Italiano')
})

/* Repro of the 2026-05-10 prod report: opening a single-lang issue
 * (only RU exists, EN dimmed), clicking English clears the title
 * field on prod even though seedFromCurrent's contract says
 * frontmatter must survive the switch. The init-time path picks
 * 'ru' as firstLang (English not in availableLanguages), so this
 * tests the RU-active → EN-dimmed direction specifically. */
test('lang-switch ru-only: switching to dimmed EN keeps the RU title', async ({
  page,
}) => {
  test.setTimeout(180_000)
  wirePageLog(page, 'lang-switch-ruonly')
  await bootRealmode(page, 'lang-switch-ruonly')
  await visit(page, '/content/magazine/edit/ru-only-issue', SLOW)
  await expectVisible(page, titleField(page), SLOW)
  await waitForCondition(
    page,
    async () =>
      (await titleField(page).inputValue()) === 'Только русский выпуск',
    SLOW
  )

  await langButton(page, 'English').click()
  /* Active flips to English. */
  await expectVisible(page, langButton(page, 'English'), SLOW)

  const titleAfter = await titleField(page).inputValue()
  expect(
    titleAfter,
    'RU → EN (dimmed) must preserve the RU title per seedFromCurrent'
  ).toBe('Только русский выпуск')
})
