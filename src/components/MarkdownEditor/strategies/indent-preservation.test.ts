import { describe, expect, it, vi } from 'vitest'
import type { LineContext } from '../line-context'
import { indentPreservation } from './indent-preservation'

const mockTextarea = () => {
  document.execCommand = vi.fn().mockReturnValue(true)
  return { value: '' } as unknown as HTMLTextAreaElement
}

const ctx = (overrides: Partial<LineContext>): LineContext => ({
  fullLine: '  hello',
  indent: '  ',
  listPrefix: undefined,
  isEmptyListItem: false,
  lineStart: 0,
  ...overrides,
})

describe('indentPreservation', () => {
  it('preserves indentation', () => {
    const el = mockTextarea()
    expect(indentPreservation(ctx({}), el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n  '
    )
  })

  it('preserves tab indentation', () => {
    const el = mockTextarea()
    const c = ctx({ indent: '\t\t' })
    expect(indentPreservation(c, el)).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith(
      'insertText',
      false,
      '\n\t\t'
    )
  })

  it('skips lines without indentation', () => {
    const el = mockTextarea()
    const c = ctx({ indent: '' })
    expect(indentPreservation(c, el)).toBe(false)
  })
})
