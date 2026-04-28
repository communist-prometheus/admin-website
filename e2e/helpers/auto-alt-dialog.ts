import type { Page } from '@playwright/test'

/**
 * Auto-accept the alt-text prompt fired by the editor on every
 * image insertion. Without this any test that triggers a paste,
 * drop, picker, or upload of an image will hang because Playwright
 * blocks on the dialog. Each test that exercises the image-insert
 * code path must call this once before the trigger.
 *
 * @param page - Playwright page
 * @param alt - Alt text to feed into the prompt (defaults to "alt")
 */
export const acceptAltDialog = (page: Page, alt = 'alt'): void => {
  page.on('dialog', dialog => {
    const action =
      dialog.type() === 'prompt' ? dialog.accept(alt) : dialog.dismiss()
    void action
  })
}
