import { click, expect, expectVisible, test } from '@prometheus/e2e-toolkit'
import { TESTID } from '../src/redesign/testids'
import { bootRedesign, goRoute, SLOW } from './helpers/redesign-page'
import { resetSandboxBaseline } from './helpers/reset-baseline'
import { headSha, waitForHeadAdvance } from './helpers/sandbox-head'
import { readFile } from './helpers/sandbox-read'

/**
 * The site's header, menu and shared captions (`common/menu`,
 * `common/labels`) had no editor in the rebuilt admin, and a language without
 * its file silently renders the default one. The «Интерфейс сайта» screen
 * edits them per language; this covers the round-trip to the repository and
 * the narrow-screen layout, where a strip of one tab per site language pushed
 * the whole page sideways.
 */

test.beforeEach(async () => {
  await resetSandboxBaseline()
})

const anchor = (id: string): string => `[data-testid="${id}"]`

/**
 * Measures whether the document scrolls sideways, and names the outermost
 * elements (shadow DOM included) that stick out, so a failure says what to fix.
 */
const pageWidths = (): { inner: number; doc: number; culprits: string } => {
  const inner = window.innerWidth
  const found: string[] = []
  const walk = (root: Document | ShadowRoot): void => {
    for (const el of root.querySelectorAll('*')) {
      const right = Math.round(el.getBoundingClientRect().right)
      const parent = el.parentElement ?? (el.getRootNode() as ShadowRoot).host
      const parentRight = parent ? parent.getBoundingClientRect().right : 0
      if (right > inner + 1 && parentRight <= inner + 1)
        found.push(
          `${el.tagName.toLowerCase()}.${String(el.getAttribute('class') ?? '')}→${right}`
        )
      if (el.shadowRoot) walk(el.shadowRoot)
    }
  }
  walk(document)
  return {
    inner,
    doc: document.documentElement.scrollWidth,
    culprits: found.slice(0, 8).join(', '),
  }
}

test('interface: a text written for a language without a file reaches the repository', async ({
  page,
}) => {
  test.setTimeout(180_000)
  const home = `Inicio ${(Date.now() % 1e6).toString(36)}`

  await bootRedesign(page, 'redesign-interface-save')
  await goRoute(page, 'interface', 'interface')

  const screen = page.locator('screen-interface')
  await click(page, screen.getByRole('tab', { name: 'ES' }), SLOW)
  const field = screen.locator('cp-input').first().getByRole('textbox')
  await expectVisible(page, field, SLOW)
  await expect(field, 'Spanish has no file in the baseline').toHaveValue('')
  await field.fill(home)

  const shaBefore = await headSha()
  await click(page, page.locator(anchor(TESTID.interfaceSave)), SLOW)
  await waitForHeadAdvance(shaBefore)

  const created = await readFile('common/menu/index.es.md')
  expect(created, 'the Spanish menu file must be created').toContain(
    `home: ${home}`
  )
  expect(created).toContain('lang: es')
  expect(
    await readFile('common/menu/index.ru.md'),
    'an unchanged language is not rewritten'
  ).toBe('---\ntitle: Навигация\nhome: Главная\nblog: Блог\nlang: ru\n---\n')
})

for (const [hash, tag] of [
  ['interface', 'interface'],
  ['categories', 'categories'],
] as const) {
  test(`${hash}: the language tabs fit a narrow phone without sideways scroll`, async ({
    page,
  }) => {
    test.setTimeout(180_000)
    await page.setViewportSize({ width: 320, height: 640 })
    await bootRedesign(page, `redesign-${tag}-narrow`)
    await goRoute(page, hash, hash)
    await expectVisible(page, page.getByRole('tab', { name: 'ES' }), SLOW)

    const widths = await page.evaluate(pageWidths)
    expect(
      widths.doc,
      `document scroll width (${widths.doc}) must not exceed the viewport (${widths.inner}); sticking out: ${widths.culprits}`
    ).toBeLessThanOrEqual(widths.inner + 1)

    /* Sign-out leaves the header at this width; it must still be reachable. */
    await click(page, page.getByRole('button', { name: 'Меню' }), SLOW)
    await expectVisible(
      page,
      page
        .getByRole('dialog', { name: 'Основная навигация' })
        .getByRole('button', { name: 'Выйти' }),
      SLOW
    )
  })
}
