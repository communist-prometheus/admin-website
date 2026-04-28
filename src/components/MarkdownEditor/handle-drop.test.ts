import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildDropTag, extractDropFile } from './handle-drop'

/**
 * Stub dataTransfer since jsdom lacks DataTransfer.
 * @param file - File to include in the drag event
 * @returns DragEvent with stubbed dataTransfer
 */
/**
 * Stub dataTransfer since jsdom lacks DataTransfer.
 * @param file - File to include in the drag event
 * @returns Drop-like object with stubbed dataTransfer
 */
const makeDragEvent = (file?: File) => ({
  dataTransfer: file ? { files: [file] } : undefined,
})

describe('extractDropFile', () => {
  it('returns file from drag event', () => {
    const file = new File([''], 'pic.png', { type: 'image/png' })
    expect(extractDropFile(makeDragEvent(file))).toBe(file)
  })

  it('returns undefined when no dataTransfer', () => {
    expect(extractDropFile(makeDragEvent())).toBeUndefined()
  })
})

describe('buildDropTag', () => {
  afterEach(() => vi.restoreAllMocks())

  it('wraps image tag with prompted alt in newlines', () => {
    vi.spyOn(globalThis, 'prompt').mockReturnValue('a fish')
    const f = new File([''], 'pic.png', { type: 'image/png' })
    expect(buildDropTag(f)).toBe('\n![a fish](./assets/pic.png)\n')
  })

  it('returns undefined when the editor cancels the alt prompt', () => {
    vi.spyOn(globalThis, 'prompt').mockReturnValue(null)
    const f = new File([''], 'pic.png', { type: 'image/png' })
    expect(buildDropTag(f)).toBeUndefined()
  })

  it('wraps video tag in newlines without prompting', () => {
    const spy = vi.spyOn(globalThis, 'prompt').mockReturnValue(null)
    const f = new File([''], 'clip.mp4', { type: 'video/mp4' })
    const tag = buildDropTag(f)
    expect(spy).not.toHaveBeenCalled()
    expect(tag).toMatch(/^\n<video controls>.*<\/video>\n$/)
  })

  it('wraps audio tag in newlines without prompting', () => {
    const spy = vi.spyOn(globalThis, 'prompt').mockReturnValue(null)
    const f = new File([''], 'song.mp3', { type: 'audio/mpeg' })
    const tag = buildDropTag(f)
    expect(spy).not.toHaveBeenCalled()
    expect(tag).toMatch(/^\n<audio controls>.*<\/audio>\n$/)
  })
})
