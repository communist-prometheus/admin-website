import { expect, test, waitForCondition } from '@prometheus/e2e-toolkit'
import { ContentEditPage } from '../pages/ContentEditPage'
import { openPreview, saveAndConfirm } from './preview-save'

const SLUG = 'media-showcase'

test.describe('Dirty State Reset After Save', () => {
  test('should not show confirm dialog after save + navigate', async ({
    page,
  }) => {
    const ep = new ContentEditPage(page)
    await ep.navigate('blog', SLUG)

    // Make an edit
    const ta = ep.getEditorBody()
    await ta.focus()
    await ta.press('End')
    await page.keyboard.type(' test-edit')

    // Save and let the request graph settle (toolkit watches
    // in-flight requests — no fixed idle window needed).
    await saveAndConfirm(page, await openPreview(page))
    await waitForCondition(page, async () => true)

    // Set up dialog listener — it should NOT fire
    let dialogFired = false
    page.on('dialog', async d => {
      dialogFired = true
      await d.accept()
    })

    // Navigate back
    await ep.clickBack()

    // Verify we navigated without a dialog
    await expect(page).toHaveURL(/\/content\/blog/, { timeout: 10000 })
    expect(dialogFired).toBe(false)
  })
})
