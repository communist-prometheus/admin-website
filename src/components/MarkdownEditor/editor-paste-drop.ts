import { buildDropTag, extractDropFile } from './handle-drop'
import { buildPasteTag, extractMediaFile } from './handle-paste'

interface Deps {
  readonly textareaRef: { readonly value: HTMLTextAreaElement | undefined }
  readonly emitPaste: (file: File) => void
  readonly emitUpload: (file: File) => void
}

const insert = (tag: string): void => {
  document.execCommand('insertText', false, tag)
}

/**
 * Factories for the paste / drop handlers on the editor textarea.
 *
 * @param deps ref to textarea plus emit callbacks
 * @returns bound event handlers
 */
export const createPasteDrop = (deps: Deps) => ({
  onPaste: (event: ClipboardEvent): void => {
    const file = extractMediaFile(event)
    if (!file || !deps.textareaRef.value) return
    event.preventDefault()
    const tag = buildPasteTag(file)
    if (!tag) return
    insert(tag)
    deps.emitPaste(file)
  },
  onDrop: (event: DragEvent): void => {
    const file = extractDropFile(event)
    if (!file || !deps.textareaRef.value) return
    event.preventDefault()
    const tag = buildDropTag(file)
    if (!tag) return
    insert(tag)
    deps.emitUpload(file)
  },
})
