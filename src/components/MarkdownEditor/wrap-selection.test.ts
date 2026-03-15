import { describe, expect, it } from 'vitest'
import { wrapSelection } from './wrap-selection'

describe('wrapSelection', () => {
  it('wraps selected text with markers', () => {
    const r = wrapSelection('hello world', 6, 11, '**', '**')
    expect(r.text).toBe('hello **world**')
    expect(r.cursorStart).toBe(8)
    expect(r.cursorEnd).toBe(13)
  })

  it('inserts empty markers when no selection', () => {
    const r = wrapSelection('hello', 5, 5, '`', '`')
    expect(r.text).toBe('hello``')
    expect(r.cursorStart).toBe(6)
    expect(r.cursorEnd).toBe(6)
  })

  it('wraps at start of content', () => {
    const r = wrapSelection('abc', 0, 3, '*', '*')
    expect(r.text).toBe('*abc*')
    expect(r.cursorStart).toBe(1)
    expect(r.cursorEnd).toBe(4)
  })

  it('handles multichar markers', () => {
    const r = wrapSelection('txt', 0, 3, '~~', '~~')
    expect(r.text).toBe('~~txt~~')
    expect(r.cursorStart).toBe(2)
    expect(r.cursorEnd).toBe(5)
  })
})
