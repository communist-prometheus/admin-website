import { expect, test } from '@playwright/test'
import { waitForNetworkIdle } from '../helpers/network'
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

    // Save and wait for all API calls to complete
    await saveAndConfirm(page, await openPreview(page))
    await waitForNetworkIdle(page, { idleTime: 1000 })

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
