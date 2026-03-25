import { describe, expect, it } from 'vitest'
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
  it('wraps image tag in newlines', () => {
    const f = new File([''], 'pic.png', { type: 'image/png' })
    expect(buildDropTag(f)).toBe('\n![pic.png](./assets/pic.png)\n')
  })

  it('wraps video tag in newlines', () => {
    const f = new File([''], 'clip.mp4', { type: 'video/mp4' })
    const tag = buildDropTag(f)
    expect(tag).toMatch(/^\n<video controls>.*<\/video>\n$/)
  })

  it('wraps audio tag in newlines', () => {
    const f = new File([''], 'song.mp3', { type: 'audio/mpeg' })
    const tag = buildDropTag(f)
    expect(tag).toMatch(/^\n<audio controls>.*<\/audio>\n$/)
  })
})
