import type { Page } from '@playwright/test'

const EDITOR = '[data-testid="editor-body"]'

/**
 * Dispatch a synthetic drop event with a media file.
 * @param page - Playwright Page
 * @param fileName - Name for the dropped file
 * @param mimeType - MIME type string
 */
export const dispatchDrop = (
  page: Page,
  fileName: string,
  mimeType: string
): Promise<void> =>
  page.evaluate(
    ({ selector, name, mime }) => {
      const file = new File([new ArrayBuffer(8)], name, {
        type: mime,
      })
      const dt = new DataTransfer()
      dt.items.add(file)
      const evt = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dt,
      })
      document.querySelector(selector)?.dispatchEvent(evt)
    },
    { selector: EDITOR, name: fileName, mime: mimeType }
  )
