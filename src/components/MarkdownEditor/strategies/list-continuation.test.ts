import { describe, expect, it, vi } from 'vitest'
import type { LineContext } from '../line-context'
import { listContinuation } from './list-continuation'

const mockTextarea = () => {
  document.execCommand = vi.fn().mockReturnValue(true)
  return { value: '', selectionStart: 0 } as unknown as HTMLTextAreaElement
}

const ctx = (overrides: Partial<LineContext>): LineContext => ({
  fullLine: '- item',
  indent: '',
  listPrefix: '- ',
  isEmptyListItem: false,
  lineStart: 0,
  ...overrides,
})

describe('listContinuation', () => {
  it('continues bullet list', () => {
    const el = mockTextarea()
    expect(listContinuation(ctx({}), el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n- '
    )
  })

  it('continues blockquote', () => {
    const el = mockTextarea()
    const c = ctx({ listPrefix: '> ' })
    expect(listContinuation(c, el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n> '
    )
  })

  it('increments ordered list number', () => {
    const el = mockTextarea()
    const c = ctx({ listPrefix: '1. ' })
    expect(listContinuation(c, el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n2. '
    )
  })

  it('increments multi-digit numbers', () => {
    const el = mockTextarea()
    const c = ctx({ listPrefix: '9. ' })
    expect(listContinuation(c, el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n10. '
    )
  })

  it('preserves indentation', () => {
    const el = mockTextarea()
    const c = ctx({ indent: '  ', listPrefix: '- ' })
    expect(listContinuation(c, el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n  - '
    )
  })

  it('skips non-list lines', () => {
    const el = mockTextarea()
    const c = ctx({ listPrefix: undefined })
    expect(listContinuation(c, el)).toBe(false)
  })
})
