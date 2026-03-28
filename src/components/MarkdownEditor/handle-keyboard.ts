import { WRAP_CMDS } from './command-defs'
import { buildLineContext } from './line-context'
import { runEnterStrategies } from './strategies/enter-pipeline'

const handleEnter = (e: KeyboardEvent): void => {
  const el = e.target
  if (!(el instanceof HTMLTextAreaElement)) return
  if (el.selectionStart !== el.selectionEnd) return
  const ctx = buildLineContext(el.value, el.selectionStart)
  if (runEnterStrategies(ctx, el)) e.preventDefault()
}

/**
 * Handle keyboard shortcuts and smart Enter.
 * @param e - Keyboard event from textarea
 * @param onWrap - Callback to wrap selection
 */
export const handleKeyboard = (
  e: KeyboardEvent,
  onWrap: (pre: string, suf: string) => void
): void => {
  if (e.key === 'Enter' && !e.shiftKey) {
    handleEnter(e)
    return
  }
  if (!e.ctrlKey && !e.metaKey) return
  const cmd = WRAP_CMDS.find(c => c.key === e.key)
  if (!cmd) return
  e.preventDefault()
  onWrap(cmd.pre, cmd.suf)
}
