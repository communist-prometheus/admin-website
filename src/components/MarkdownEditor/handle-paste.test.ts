import { describe, expect, it } from 'vitest'
import { buildPasteTag, extractMediaFile } from './handle-paste'

/**
 * Stub clipboardData since jsdom lacks DataTransfer.
 * @param type - MIME type of the file to add
 * @returns ClipboardEvent with stubbed clipboardData
 */
const makeClipboardEvent = (type?: string): ClipboardEvent => {
  const evt = new Event('paste', {
    bubbles: true,
    cancelable: true,
  }) as ClipboardEvent

  if (type) {
    const file = new File(['data'], 'test-file', { type })
    const items = [{ type, getAsFile: () => file }]
    Object.defineProperty(evt, 'clipboardData', {
      value: { items },
      writable: false,
    })
  }
  return evt
}

describe('extractMediaFile', () => {
  it('returns image file', () => {
    const f = extractMediaFile(makeClipboardEvent('image/png'))
    expect(f).toBeDefined()
    expect(f?.type).toBe('image/png')
  })

  it('returns video file', () => {
    const f = extractMediaFile(makeClipboardEvent('video/mp4'))
    expect(f).toBeDefined()
    expect(f?.type).toBe('video/mp4')
  })

  it('returns audio file', () => {
    const f = extractMediaFile(makeClipboardEvent('audio/mpeg'))
    expect(f).toBeDefined()
    expect(f?.type).toBe('audio/mpeg')
  })

  it('returns undefined for non-media', () => {
    expect(extractMediaFile(makeClipboardEvent('text/plain'))).toBeUndefined()
  })

  it('returns undefined when no clipboardData', () => {
    expect(extractMediaFile(makeClipboardEvent())).toBeUndefined()
  })
})

describe('buildPasteTag', () => {
  it('produces image markdown', () => {
    const f = new File([''], 'pic.png', { type: 'image/png' })
    expect(buildPasteTag(f)).toBe('\n![pic.png](./assets/pic.png)\n')
  })

  it('produces video HTML', () => {
    const f = new File([''], 'clip.mp4', { type: 'video/mp4' })
    const tag = buildPasteTag(f)
    expect(tag).toContain('<video controls>')
    expect(tag).toContain('src="./assets/clip.mp4"')
  })

  it('produces audio HTML', () => {
    const f = new File([''], 'song.mp3', { type: 'audio/mpeg' })
    const tag = buildPasteTag(f)
    expect(tag).toContain('<audio controls>')
    expect(tag).toContain('src="./assets/song.mp3"')
  })
})
