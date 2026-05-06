import { describe, expect, it } from 'vitest'
import { filesFromDrop, filesFromPaste } from './attachment-pipeline'

const fakeFile = (name: string, type: string): File =>
  new File(['x'], name, { type })

describe('filesFromDrop', () => {
  it('returns empty array when dataTransfer is missing', () => {
    const e = { dataTransfer: null } as unknown as DragEvent
    expect(filesFromDrop(e)).toEqual([])
  })

  it('returns the dropped files in order', () => {
    const a = fakeFile('a.png', 'image/png')
    const b = fakeFile('b.jpg', 'image/jpeg')
    const e = {
      dataTransfer: { files: [a, b] },
    } as unknown as DragEvent
    expect(filesFromDrop(e)).toEqual([a, b])
  })
})

describe('filesFromPaste', () => {
  it('returns empty array when clipboardData is missing', () => {
    const e = { clipboardData: null } as unknown as ClipboardEvent
    expect(filesFromPaste(e)).toEqual([])
  })

  it('returns only file-kind items, mapping via getAsFile', () => {
    const png = fakeFile('paste.png', 'image/png')
    const items = [
      { kind: 'string', getAsFile: () => null },
      { kind: 'file', getAsFile: () => png },
      { kind: 'file', getAsFile: () => null },
    ]
    const e = { clipboardData: { items } } as unknown as ClipboardEvent
    expect(filesFromPaste(e)).toEqual([png])
  })
})
