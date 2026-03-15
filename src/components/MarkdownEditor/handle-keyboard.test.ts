import { describe, expect, it, vi } from 'vitest'
import { handleKeyboard } from './handle-keyboard'

const makeKeydown = (key: string, ctrlKey = false): KeyboardEvent =>
  new KeyboardEvent('keydown', { key, ctrlKey, bubbles: true })

describe('handleKeyboard', () => {
  it('calls onWrap for Ctrl+B', () => {
    const onWrap = vi.fn()
    handleKeyboard(makeKeydown('b', true), onWrap)
    expect(onWrap).toHaveBeenCalledWith('**', '**')
  })

  it('calls onWrap for Ctrl+I', () => {
    const onWrap = vi.fn()
    handleKeyboard(makeKeydown('i', true), onWrap)
    expect(onWrap).toHaveBeenCalledWith('*', '*')
  })

  it('calls onWrap for Ctrl+E', () => {
    const onWrap = vi.fn()
    handleKeyboard(makeKeydown('e', true), onWrap)
    expect(onWrap).toHaveBeenCalledWith('`', '`')
  })

  it('does not call onWrap without Ctrl', () => {
    const onWrap = vi.fn()
    handleKeyboard(makeKeydown('b', false), onWrap)
    expect(onWrap).not.toHaveBeenCalled()
  })

  it('does not call onWrap for unbound key', () => {
    const onWrap = vi.fn()
    handleKeyboard(makeKeydown('z', true), onWrap)
    expect(onWrap).not.toHaveBeenCalled()
  })
})
