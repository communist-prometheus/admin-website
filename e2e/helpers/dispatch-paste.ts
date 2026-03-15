import type { Page } from '@playwright/test'

const EDITOR = '[data-testid="editor-body"]'

/**
 * Dispatch a synthetic paste event with a media file.
 * For images, creates a real 1x1 canvas blob.
 * For non-images, creates a File from an ArrayBuffer.
 * @param page - Playwright Page
 * @param fileName - Name for the pasted file
 * @param mimeType - MIME type string
 */
export const dispatchMediaPaste = (
  page: Page,
  fileName: string,
  mimeType: string
): Promise<void> =>
  mimeType.startsWith('image/')
    ? page.evaluate(
        ({ selector, name, mime }) =>
          new Promise<void>(resolve => {
            const canvas = document.createElement('canvas')
            canvas.width = 1
            canvas.height = 1
            canvas.toBlob(blob => {
              if (!blob) return resolve()
              const file = new File([blob], name, {
                type: mime,
              })
              const dt = new DataTransfer()
              dt.items.add(file)
              const evt = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
              })
              Object.defineProperty(evt, 'clipboardData', {
                value: dt,
                writable: false,
              })
              document.querySelector(selector)?.dispatchEvent(evt)
              resolve()
            }, mime)
          }),
        { selector: EDITOR, name: fileName, mime: mimeType }
      )
    : page.evaluate(
        ({ selector, name, mime }) => {
          const file = new File([new ArrayBuffer(8)], name, { type: mime })
          const dt = new DataTransfer()
          dt.items.add(file)
          const evt = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
          })
          Object.defineProperty(evt, 'clipboardData', {
            value: dt,
            writable: false,
          })
          document.querySelector(selector)?.dispatchEvent(evt)
        },
        { selector: EDITOR, name: fileName, mime: mimeType }
      )
