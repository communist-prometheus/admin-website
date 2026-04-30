import { describe, expect, it } from 'vitest'
import { base64urlDecode, base64urlEncode } from './base64url'

describe('base64url', () => {
  it('round-trips an ASCII string', () => {
    const raw = 'hello world'
    const enc = base64urlEncode(raw)
    expect(new TextDecoder().decode(base64urlDecode(enc))).toBe(raw)
  })

  it('round-trips bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 250, 251])
    const enc = base64urlEncode(bytes.buffer)
    expect(Array.from(base64urlDecode(enc))).toEqual([...bytes])
  })

  it('uses the URL-safe alphabet (no +, /, =)', () => {
    const enc = base64urlEncode(new Uint8Array([0, 0, 0, 0, 0, 250, 250]))
    expect(enc).not.toMatch(/[+/=]/)
  })
})
