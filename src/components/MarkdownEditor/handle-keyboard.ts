import { WRAP_CMDS } from './command-defs'

/**
 * Handle keyboard shortcuts for formatting commands.
 * @param e - Keyboard event from textarea
 * @param onWrap - Callback to wrap selection
 */
export const handleKeyboard = (
  e: KeyboardEvent,
  onWrap: (pre: string, suf: string) => void
): void => {
  if (!e.ctrlKey && !e.metaKey) return
  const cmd = WRAP_CMDS.find(c => c.key === e.key)
  if (!cmd) return
  e.preventDefault()
  onWrap(cmd.pre, cmd.suf)
}
