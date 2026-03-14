import { describe, expect, it } from 'vitest'
import { detectMime } from './detect-mime'

describe('detectMime', () => {
  it('detects image types', () => {
    expect(detectMime('photo.png')).toBe('image/png')
    expect(detectMime('photo.jpg')).toBe('image/jpeg')
    expect(detectMime('photo.jpeg')).toBe('image/jpeg')
    expect(detectMime('icon.svg')).toBe('image/svg+xml')
    expect(detectMime('pic.webp')).toBe('image/webp')
    expect(detectMime('pic.avif')).toBe('image/avif')
    expect(detectMime('pic.gif')).toBe('image/gif')
    expect(detectMime('favicon.ico')).toBe('image/x-icon')
  })

  it('detects video types', () => {
    expect(detectMime('clip.mp4')).toBe('video/mp4')
    expect(detectMime('clip.webm')).toBe('video/webm')
    expect(detectMime('clip.ogg')).toBe('video/ogg')
    expect(detectMime('clip.mov')).toBe('video/quicktime')
  })

  it('detects audio types', () => {
    expect(detectMime('song.mp3')).toBe('audio/mpeg')
    expect(detectMime('song.m4a')).toBe('audio/mp4')
    expect(detectMime('song.wav')).toBe('audio/wav')
    expect(detectMime('song.flac')).toBe('audio/flac')
    expect(detectMime('song.aac')).toBe('audio/aac')
    expect(detectMime('song.opus')).toBe('audio/opus')
  })

  it('detects document types', () => {
    expect(detectMime('doc.pdf')).toBe('application/pdf')
    expect(detectMime('data.json')).toBe('application/json')
    expect(detectMime('feed.xml')).toBe('application/xml')
  })

  it('returns fallback for unknown extensions', () => {
    expect(detectMime('file.xyz')).toBe('application/octet-stream')
    expect(detectMime('noext')).toBe('application/octet-stream')
  })

  it('handles paths with directories', () => {
    expect(detectMime('a/b/c/image.png')).toBe('image/png')
  })

  it('is case-insensitive', () => {
    expect(detectMime('photo.PNG')).toBe('image/png')
    expect(detectMime('photo.JPG')).toBe('image/jpeg')
  })
})
