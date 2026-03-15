import { describe, expect, it } from 'vitest'
import { insertLinePrefix } from './insert-line-prefix'

describe('insertLinePrefix', () => {
  it('inserts prefix at line start', () => {
    const r = insertLinePrefix('hello', 3, '## ')
    expect(r.text).toBe('## hello')
    expect(r.cursorStart).toBe(6)
  })

  it('inserts on second line', () => {
    const r = insertLinePrefix('aaa\nbbb', 5, '- ')
    expect(r.text).toBe('aaa\n- bbb')
    expect(r.cursorStart).toBe(7)
  })

  it('inserts at very start of content', () => {
    const r = insertLinePrefix('text', 0, '> ')
    expect(r.text).toBe('> text')
    expect(r.cursorStart).toBe(2)
  })

  it('handles cursor at end of line', () => {
    const r = insertLinePrefix('line1\nline2', 5, '1. ')
    expect(r.text).toBe('1. line1\nline2')
    expect(r.cursorStart).toBe(8)
  })
})
