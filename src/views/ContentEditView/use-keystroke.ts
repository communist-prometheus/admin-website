import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Attach a global keydown listener that runs `handler` when the given
 * key is pressed. Cleaned up on unmount.
 *
 * @param key the `event.key` value to match
 * @param handler callback invoked on match
 */
export const onKeyStroke = (
  key: string,
  handler: (event: KeyboardEvent) => void
): void => {
  const listener = (event: KeyboardEvent) => {
    if (event.key === key) handler(event)
  }
  onMounted(() => {
    globalThis.addEventListener('keydown', listener)
  })
  onBeforeUnmount(() => {
    globalThis.removeEventListener('keydown', listener)
  })
}
