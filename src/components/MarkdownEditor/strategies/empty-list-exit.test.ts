import { describe, expect, it, vi } from 'vitest'
import type { LineContext } from '../line-context'
import { emptyListExit } from './empty-list-exit'

const mockTextarea = (value: string) => {
  const el = {
    value,
    selectionStart: 0,
    selectionEnd: 0,
    setSelectionRange: vi.fn(),
  }
  document.execCommand = vi.fn().mockReturnValue(true)
  return el as unknown as HTMLTextAreaElement
}

const ctx = (overrides: Partial<LineContext>): LineContext => ({
  fullLine: '- ',
  indent: '',
  listPrefix: '- ',
  isEmptyListItem: true,
  lineStart: 0,
  ...overrides,
})

describe('emptyListExit', () => {
  it('removes empty bullet prefix', () => {
    const el = mockTextarea('- ')
    expect(emptyListExit(ctx({}), el)).toBe(true)
    expect(el.setSelectionRange).toHaveBeenCalledWith(0, 2)
    expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '')
  })

  it('removes empty ordered prefix', () => {
    const el = mockTextarea('1. ')
    const c = ctx({ fullLine: '1. ', listPrefix: '1. ' })
    expect(emptyListExit(c, el)).toBe(true)
    expect(el.setSelectionRange).toHaveBeenCalledWith(0, 3)
  })

  it('skips non-empty list items', () => {
    const el = mockTextarea('- item')
    const c = ctx({ isEmptyListItem: false })
    expect(emptyListExit(c, el)).toBe(false)
  })

  it('skips non-list lines', () => {
    const el = mockTextarea('hello')
    const c = ctx({
      listPrefix: undefined,
      isEmptyListItem: false,
    })
    expect(emptyListExit(c, el)).toBe(false)
  })
})
