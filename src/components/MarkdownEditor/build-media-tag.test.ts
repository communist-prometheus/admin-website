import { describe, expect, it } from 'vitest'
import { buildMediaTag } from './build-media-tag'

describe('buildMediaTag', () => {
  it('builds markdown image tag', () => {
    expect(buildMediaTag('pic.png', 'image/png')).toBe(
      '![pic.png](./assets/pic.png)'
    )
  })

  it('builds video HTML tag', () => {
    const r = buildMediaTag('clip.mp4', 'video/mp4')
    expect(r).toContain('<video controls>')
    expect(r).toContain('src="./assets/clip.mp4"')
    expect(r).toContain('type="video/mp4"')
  })

  it('builds audio HTML tag', () => {
    const r = buildMediaTag('song.mp3', 'audio/mpeg')
    expect(r).toContain('<audio controls>')
    expect(r).toContain('src="./assets/song.mp3"')
    expect(r).toContain('type="audio/mpeg"')
  })

  it('falls back to link for unknown types', () => {
    expect(buildMediaTag('doc.pdf', 'application/pdf')).toBe(
      '[doc.pdf](./assets/doc.pdf)'
    )
  })
})
