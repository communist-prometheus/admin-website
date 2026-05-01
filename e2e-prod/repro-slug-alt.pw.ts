import 'dotenv/config'
import process from 'node:process'
import { type Dialog, expect, test } from '@prometheus/e2e-toolkit'

/**
 * Regression coverage for #67 (slug input sanitization) and #68
 * (image alt text prompt) on the deployed dev-admin. Hits the
 * editor for an existing blog article so we don't have to set up
 * a fresh one for every run.
 */

const TARGET_BASE =
  process.env['REPRO_BASE_URL'] ?? 'https://dev-admin.comprom.org'
const TARGET_PATH = '/content/blog/edit/media-showcase'
const PAT = process.env['GITHUB_E2E_KEY'] ?? ''

const out = (s: string): void => {
  process.stdout.write(`${s}\n`)
}

test.describe('post-deploy slug + alt', () => {
  test.beforeEach(async ({ page }) => {
    if (!PAT) throw new Error('GITHUB_E2E_KEY required in .env')
    await page.goto(`${TARGET_BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(t => localStorage.setItem('gh_token', t), PAT)
    await page.goto(`${TARGET_BASE}${TARGET_PATH}`, {
      waitUntil: 'domcontentloaded',
    })
  })

  test('slug input strips uppercase + non-Latin keystrokes', async ({
    page,
  }) => {
    // Wait for the editor body to load — until then a click on the
    // heading races with Vue re-rendering EditableSlug and silently
    // gets eaten. The test was flaky in suite mode because the prior
    // test left network in flight; isolation fixed it but only by
    // accident. Hold for editor-body before touching the heading.
    await page
      .locator('[data-testid="editor-body"]')
      .waitFor({ state: 'visible', timeout: 60_000 })

    const heading = page.locator('[data-testid="edit-title"]')
    await heading.waitFor({ state: 'visible', timeout: 30_000 })
    const input = page.locator('[data-testid="slug-input"]')
    await expect
      .poll(
        async () => {
          await heading.click({ trial: false }).catch(() => undefined)
          return await input.isVisible().catch(() => false)
        },
        { timeout: 15_000, intervals: [500, 1000] }
      )
      .toBe(true)

    await input.fill('')
    await input.type('FooBar', { delay: 20 })
    expect(await input.inputValue()).toBe('foobar')

    await input.fill('')
    await input.type('пост-test', { delay: 20 })
    expect(await input.inputValue()).toBe('-test')

    await input.press('Escape')
  })

  test('alt prompt fires when an image is pasted', async ({ page }) => {
    let prompted = ''
    page.on('dialog', async (d: Dialog) => {
      if (d.type() === 'prompt') {
        prompted = d.message()
        await d.accept('a meaningful alt')
      } else {
        await d.dismiss()
      }
    })

    const editor = page.locator('[data-testid="editor-body"]')
    await editor.waitFor({ state: 'visible', timeout: 60_000 })
    await editor.focus()
    await editor.fill('')

    // Drive a synthetic ClipboardEvent on the textarea — the editor
    // listens for paste, extracts the image File, and triggers the
    // alt prompt.
    await page.evaluate(() => {
      const el = document.querySelector(
        '[data-testid="editor-body"]'
      ) as HTMLTextAreaElement
      const dt = new DataTransfer()
      dt.items.add(
        new File([new Uint8Array([137, 80, 78, 71])], 'pic.png', {
          type: 'image/png',
        })
      )
      el.dispatchEvent(
        new ClipboardEvent('paste', {
          clipboardData: dt,
          bubbles: true,
          cancelable: true,
        })
      )
    })

    await page.waitForFunction(
      () => {
        const el = document.querySelector(
          '[data-testid="editor-body"]'
        ) as HTMLTextAreaElement | null
        return !!el && el.value.includes('a meaningful alt')
      },
      undefined,
      { timeout: 10_000 }
    )

    out(`prompt message: ${prompted}`)
    expect(
      prompted.length,
      'prompt should fire for image insert'
    ).toBeGreaterThan(0)
    expect(await editor.inputValue()).toContain(
      '![a meaningful alt](./assets/pic.png)'
    )
  })
})
