import { describe, expect, it } from 'vitest'
import { buildLineContext } from './line-context'

describe('buildLineContext', () => {
  it('parses plain text line', () => {
    const ctx = buildLineContext('hello world', 5)
    expect(ctx.indent).toBe('')
    expect(ctx.listPrefix).toBeUndefined()
    expect(ctx.isEmptyListItem).toBe(false)
  })

  it('parses indented line', () => {
    const ctx = buildLineContext('  hello', 4)
    expect(ctx.indent).toBe('  ')
    expect(ctx.listPrefix).toBeUndefined()
  })

  it('parses bullet list item', () => {
    const ctx = buildLineContext('- item', 6)
    expect(ctx.indent).toBe('')
    expect(ctx.listPrefix).toBe('- ')
    expect(ctx.isEmptyListItem).toBe(false)
  })

  it('detects empty bullet list item', () => {
    const ctx = buildLineContext('- ', 2)
    expect(ctx.listPrefix).toBe('- ')
    expect(ctx.isEmptyListItem).toBe(true)
  })

  it('parses ordered list item', () => {
    const ctx = buildLineContext('1. item', 7)
    expect(ctx.listPrefix).toBe('1. ')
    expect(ctx.isEmptyListItem).toBe(false)
  })

  it('detects empty ordered list item', () => {
    const ctx = buildLineContext('1. ', 3)
    expect(ctx.listPrefix).toBe('1. ')
    expect(ctx.isEmptyListItem).toBe(true)
  })

  it('parses blockquote', () => {
    const ctx = buildLineContext('> quote', 7)
    expect(ctx.listPrefix).toBe('> ')
  })

  it('parses indented list item', () => {
    const ctx = buildLineContext('  - nested', 10)
    expect(ctx.indent).toBe('  ')
    expect(ctx.listPrefix).toBe('- ')
  })

  it('handles multiline at correct line', () => {
    const text = 'line one\n- item\nline three'
    const ctx = buildLineContext(text, 14)
    expect(ctx.fullLine).toBe('- item')
    expect(ctx.listPrefix).toBe('- ')
  })

  it('parses asterisk list item', () => {
    const ctx = buildLineContext('* item', 6)
    expect(ctx.listPrefix).toBe('* ')
  })
})
